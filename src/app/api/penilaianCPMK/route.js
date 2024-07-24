import prisma from "@/utils/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const prodi = searchParams.get("prodi") || ""; // Access prodi query parameter

  // Validate prodi parameter if necessary
  if (!prodi) {
    return Response.json({ status: 400, message: "Missing prodi parameter" });
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

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
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

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({
        status: 400,
        message: "Kombinasi MK dan CPMK sudah ada",
      });
    }
    console.log(error.message);
    return Response.json({
      status: 400,
      message: error.message || "Something went wrong!",
    });
  }
}
