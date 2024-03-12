import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const cpl = await prisma.cpl.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: cpl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const cpl = await prisma.cpl.create({ data });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: cpl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}