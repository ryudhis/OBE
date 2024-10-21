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
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return new Response(
      JSON.stringify({ status: 400, message: "Missing prodi parameter" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const CPMK = await prisma.CPMK.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        CPL: {
          include: {
            PL: true,
            BK: true,
          },
        },
        MK: {
          include: {
            BK: true,
          },
        },
        penilaianCPMK: true,
        lulusCPMK: { include: { tahunAjaran: true } },
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: CPMK,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("GET CPMK Error: ", error); // More informative error logging
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
    const { prodiId, CPLId, ...restData } = data; // Extract prodiId from data

    // Create the CPMK entry and connect it to the CPL and prodi
    const CPMK = await prisma.CPMK.create({
      data: {
        ...restData,
        CPL: {
          connect: {
            kode_prodiId: {
              kode: CPLId,
              prodiId: prodiId,
            },
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
        data: CPMK,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("POST CPMK Error: ", error); // More informative error logging
    return new Response(
      JSON.stringify({ status: 500, message: "Something went wrong!" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}