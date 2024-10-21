import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || "";

  // Validate prodi parameter
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const inputNilai = await prisma.inputNilai.findMany({
      where: {
        prodiId: prodi,
      },
      orderBy: [{ penilaianCPMKId: "asc" }, { mahasiswaNim: "asc" }],
      include: { penilaianCPMK: true, mahasiswa: true },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: inputNilai,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("GET inputNilai Error: ", error); // More informative logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await req.json();

    const inputNilaiData = data.map((mahasiswa) => ({
      penilaianCPMKId: parseInt(mahasiswa.PCPMKId),
      mahasiswaNim: mahasiswa.MahasiswaId,
      kelasId: mahasiswa.kelasId,
      nilai: mahasiswa.nilai,
      prodiId: mahasiswa.prodiId,
    }));

    // Use createMany to insert all entries at once
    const inputNilai = await prisma.inputNilai.createMany({
      data: inputNilaiData,
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: inputNilai,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("POST inputNilai Error: ", error); // More informative logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
