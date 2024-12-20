import prisma from "@/utils/prisma";
import { validateToken } from "@/utils/auth"; // Assuming you have a token validation function

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
    const penilaianCPMK = await prisma.penilaianCPMK.findMany({
      where: {
        prodiId: prodi,
      },
      include: {
        CPMK: true,
        CPL: true,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: penilaianCPMK,
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
    const { prodiId, ...restData } = data; // Extract prodiId from data

    const filteredPCPMK = await prisma.penilaianCPMK.findMany({
      where: {
        MKkode: data.MK,
      },
    });

    let totalBobot = 0;

    filteredPCPMK.forEach((pcpmk) => {
      pcpmk.kriteria.forEach((kriteria) => {
        totalBobot += kriteria.bobot;
      });
    });

    let currentBobot = 0;

    data.kriteria.forEach((kriteria) => {
      currentBobot += kriteria.bobot;
    });

    if (totalBobot + currentBobot > 100) {
      throw new Error(
        `Bobot MK Melebihi 100, Bobot saat ini sudah ${totalBobot}`
      );
    }

    const penilaianCPMK = await prisma.penilaianCPMK.create({
      data: {
        ...restData,
        MK: {
          connect: {
            kode: data.MK,
          },
        },
        CPMK: {
          connect: {
            kode_prodiId: {
              kode: data.CPMK,
              prodiId: prodiId,
            },
          },
        },
        CPL: {
          connect: {
            kode_prodiId: {
              kode: data.CPL,
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
        data: penilaianCPMK,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Kombinasi MK dan CPMK sudah ada",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(error.message);
    return new Response(
      JSON.stringify({
        status: 400,
        message: error.message || "Something went wrong!",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
