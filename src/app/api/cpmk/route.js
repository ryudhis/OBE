import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const CPMK = await prisma.CPMK.findMany({
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
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const CPMK = await prisma.CPMK.create({ data });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}


