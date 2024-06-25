import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const prodi = await prisma.prodi.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    // Create the PL entry and connect it to the prodi
    const prodi = await prisma.PL.create({
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
