import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth";

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
  const mk = searchParams.get("mk") || ""; 

  // Validate mk parameter if necessary
  if (!mk) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing mk parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch MK data filtered by MKId
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findMany({
      where: {
        MKId: mk,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: rencanaPembelajaran,
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
    const { MKId, ...restData } = data;

    console.log(data);

    const rencanaPembelajaran = await prisma.rencanaPembelajaran.create({
      data: {
        ...restData,
        MK: {
          connect: {
            kode: MKId,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: rencanaPembelajaran,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req) {
  // Validate the token
  const tokenValidation = validateToken(req);
  if (!tokenValidation.valid) {
    return new Response(
      JSON.stringify({ status: 401, message: tokenValidation.message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const mk = searchParams.get("mk") || ""; // Access mk query parameter

  // Validate mk parameter if necessary
  if (!mk) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing mk parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.deleteMany({
      where: {
        MKId: mk,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil hapus data!",
        data: rencanaPembelajaran,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
