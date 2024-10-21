import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; 

export async function GET(req) {
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const mahasiswa = await prisma.mahasiswa.findMany({
      orderBy: { nim: "asc" },
      where: {
        prodiId: prodi,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: mahasiswa,
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
    
    // Validate that necessary fields are present
    if (!data.prodiId) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing prodiId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!data.nama || !data.nim) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing nama or nim in data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the mahasiswa entry
    const mahasiswa = await prisma.mahasiswa.create({
      data: {
        ...data,
        prodi: {
          connect: {
            kode: data.prodiId, // Use the correct identifier based on your model
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: mahasiswa,
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
