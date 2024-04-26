import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const mahasiswa = await prisma.mahasiswa.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: mahasiswa,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const mahasiswa = await prisma.mahasiswa.create({ data });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: mahasiswa,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
