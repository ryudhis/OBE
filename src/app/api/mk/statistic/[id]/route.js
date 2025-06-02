import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

function getIndex(nilai) {
  if (nilai >= 75) return "A";
  if (nilai >= 70) return "AB";
  if (nilai >= 65) return "B";
  if (nilai >= 60) return "BC";
  if (nilai >= 50) return "C";
  if (nilai >= 40) return "D";
  return "E";
}

function getStats(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      values.length
  );
  return { min, max, range, average, stdDev };
}

function analyzeMahasiswaLulus(kelasList) {
  const allMahasiswa = kelasList.flatMap((kelas) => kelas.mahasiswaLulus || []);
  const kriteriaMap = {};
  const totalNilaiList = [];
  const indexCount = { A: 0, AB: 0, B: 0, BC: 0, C: 0, D: 0, E: 0 };
  const cpmkMap = {};

  for (const mhs of allMahasiswa) {
    totalNilaiList.push(Number(mhs.totalNilai));

    indexCount[mhs.indexNilai] = (indexCount[mhs.indexNilai] || 0) + 1;

    for (const k of mhs.nilaiKriteria || []) {
      if (!kriteriaMap[k.kriteria]) kriteriaMap[k.kriteria] = [];
      kriteriaMap[k.kriteria].push(k.nilai);
    }

    for (const cpmk of mhs.nilaiMahasiswa || []) {
      if (!cpmkMap[cpmk.namaCPMK]) cpmkMap[cpmk.namaCPMK] = [];
      // Use totalNilai or average of nilai array if needed
      const nilai =
        Array.isArray(cpmk.nilai) && cpmk.nilai.length > 0
          ? cpmk.nilai.reduce((a, b) => a + b, 0) / cpmk.nilai.length
          : cpmk.totalNilai;
      cpmkMap[cpmk.namaCPMK].push(nilai);
    }
  }

  const kriteriaStats = Object.entries(kriteriaMap).map(
    ([kriteria, values]) => ({
      kriteria,
      ...getStats(values),
    })
  );

  const totalNilaiStats = totalNilaiList.length
    ? getStats(totalNilaiList)
    : null;

  const cpmkStats = Object.entries(cpmkMap).map(([namaCPMK, values]) => {
    const validValues = values.filter((v) => typeof v === "number");
    const avg =
      validValues.length > 0
        ? validValues.reduce((a, b) => a + b, 0) / validValues.length
        : null;
    return {
      namaCPMK,
      averageNilai: avg,
      index: avg !== null ? getIndex(avg) : "E",
    };
  });

  return {
    totalMahasiswa: allMahasiswa.length,
    totalNilaiStats: totalNilaiStats || {
      min: null,
      max: null,
      range: null,
      average: null,
      stdDev: null,
    },
    kriteriaStats,
    indexDistribution: indexCount,
    cpmkStats,
  };
}

export async function GET(req, { params }) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { id: kode } = params;
    const { searchParams } = new URL(req.url);
    const tahunAjaranId = searchParams.get("tahunAjaran");

    console.log("tahunAjaranId:", tahunAjaranId);

    const kelasList = await prisma.kelas.findMany({
      where: {
        MKId: kode,
        tahunAjaranId: parseInt(tahunAjaranId),
      },
      include: {
        tahunAjaran: true,
      },
    });

    if (!kelasList || kelasList.length === 0) {
      return new Response(
        JSON.stringify({
          status: 200,
          message:
            "No kelas found yet for MK and tahunAjaran — returning empty statistics.",
          data: {
            totalMahasiswa: 0,
            totalNilaiStats: {
              min: null,
              max: null,
              range: null,
              average: null,
              stdDev: null,
            },
            kriteriaStats: [],
            indexDistribution: { A: 0, AB: 0, B: 0, BC: 0, C: 0, D: 0, E: 0 },
            cpmkStats: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const statistik = analyzeMahasiswaLulus(kelasList);

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil data kelas dan statistik!",
        data: statistik,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
