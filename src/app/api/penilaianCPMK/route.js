import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const penilaianCPMK = await prisma.penilaianCPMK.findMany();

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
    const filteredPCPMK = await prisma.penilaianCPMK.findMany({
      where: {
        MKkode: data.MK,
      }
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
      throw new Error(`Bobot MK Melebihi 100, Bobot saat ini sudah ${totalBobot}`);
    }

    const penilaianCPMK = await prisma.penilaianCPMK.create({
      data: {
        ...data,
        MK: {
          connect: {
            kode: data.MK,
          },
        },
        CPMK: {
          connect: {
            kode: data.CPMK,
          },
        },
        CPL: {
          connect: {
            kode: data.CPL,
          },
        }
      }
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error.message);
    return Response.json({ status: 400, message: error.message || "Something went wrong!" });
  }
}

