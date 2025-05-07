import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function POST(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await req.json();

    const inputNilaiData = [];

    for (const mahasiswa of data) {
      const nilaiGrouped = {};

      for (const item of mahasiswa.nilai) {
        const id = parseInt(item.id);
        if (!nilaiGrouped[id]) {
          nilaiGrouped[id] = [];
        }
        nilaiGrouped[id].push(item.value);
      }

      for (const [penilaianCPMKId, nilaiArray] of Object.entries(
        nilaiGrouped
      )) {
        inputNilaiData.push({
          penilaianCPMKId: parseInt(penilaianCPMKId),
          mahasiswaNim: mahasiswa.nim.toString(),
          nilai: nilaiArray,
          kelasId: mahasiswa.kelasId,
          prodiId: mahasiswa.prodiId,
        });
      }
    }

    const created = await prisma.inputNilai.createMany({
      data: inputNilaiData,
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: created,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST inputNilai Error:", error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
