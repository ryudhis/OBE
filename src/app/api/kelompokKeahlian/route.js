import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Ensure the path to your validateToken utility is correct

// GET kelompokKeahlian with optional prodi parameter
export async function GET(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const KK = await prisma.kelompokKeahlian.findMany({
      where: {
        prodiId: prodi,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: KK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST to create a new kelompokKeahlian
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
    const data = await req.json();
    const { prodiId, ketua, ...restData } = data; // Extract prodiId from data

    // Validate prodiId and other necessary fields
    if (!prodiId) {
      return new Response(
        JSON.stringify({ status: 400, message: "Missing prodiId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the KK entry and connect it to the prodi
    const KK = await prisma.kelompokKeahlian.create({
      data: {
        ...restData,
        ketua: {
          connect: {
            id: ketua, 
          },
        },
        prodi: {
          connect: {
            kode: prodiId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: KK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
