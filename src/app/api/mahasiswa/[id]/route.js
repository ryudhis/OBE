import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const nim = req.url.split("/mahasiswa/")[1];
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: {
        nim,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: mahasiswa,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const nim = req.url.split("/mahasiswa/")[1];
    const mahasiswa = await prisma.mahasiswa.delete({
      where: {
        nim,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: mahasiswa,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const nim = req.url.split("/mahasiswa/")[1];
    const data = await req.json();

    const mahasiswa = await prisma.mahasiswa.update({
      where: {
        nim,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: mahasiswa,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
