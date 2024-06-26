import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const MK = await prisma.MK.findMany({
      include: {
        BK: true,
        CPMK: { include: { CPL: true } },
        kelas: { include: { mahasiswa: true } },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const MK = await prisma.MK.create({
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
