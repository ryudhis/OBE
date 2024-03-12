import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const pl = await prisma.pl.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: pl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const pl = await prisma.pl.create({ data });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: pl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}