import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/relasi/")[1];
    const body = await req.json();

    console.log(body);

    const MK = await prisma.MK.update({
      where: {
        kode,
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        mahasiswa: {
          disconnect: body.removedMahasiswaId.map((MahasiswaId) => ({ nim: MahasiswaId })),
          connect: body.addedMahasiswaId.map((MahasiswaId) => ({ nim: MahasiswaId })),
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
