import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const BK = await prisma.BK.findMany({
      include: {
        CPL: {
          include: {
            PL: true,
            CPMK: true,
          },
        },
        MK: {
          include: {
            CPMK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: BK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const BK = await prisma.BK.create({ data });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: BK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}