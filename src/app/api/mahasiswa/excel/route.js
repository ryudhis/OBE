import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function POST(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const dataArray = await req.json();

    // Validate that mahasiswa array and prodiId are present
    if (!Array.isArray(dataArray.mahasiswa) || dataArray.mahasiswa.length === 0) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing mahasiswa data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!dataArray.prodiId) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing prodiId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create mahasiswa entries
    const createdMahasiswa = await prisma.mahasiswa.createMany({
      data: dataArray.mahasiswa.map((data) => ({
        nama: data.Nama,
        nim: String(data.NIM),
        prodiId: dataArray.prodiId,
      })),
      skipDuplicates: true,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: createdMahasiswa,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
