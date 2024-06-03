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
    const penilaianCPMK = await prisma.penilaianCPMK.create({ data:{
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
    } });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
