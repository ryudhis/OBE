import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const tahunAjaran = await prisma.tahunAjaran.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: tahunAjaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const tahunAjaran = await prisma.tahunAjaran.create({
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: tahunAjaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
