import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/prodi/")[1];
    const prodi = await prisma.prodi.findUnique({
      where: {
        kode,
      },
      include: {
        tendik: true,
        mahasiswa: true,
        MK: true,
        KK: {
          include:{
            ketua: true,
            MK: true,
          }
        },
        kaprodi: true,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/prodi/")[1];
    const prodi = await prisma.prodi.delete({
      where: {
        kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/prodi/")[1];
    const data = await req.json();

    const prodi = await prisma.prodi.update({
      where: {
        kode,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
