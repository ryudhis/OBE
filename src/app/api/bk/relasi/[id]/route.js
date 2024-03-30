import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/relasi/")[1];
    const body = await req.json();

    const BK = await prisma.BK.update({
      where: {
        kode,
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        min: body.min,
        max: body.max,
        MK: {
          disconnect: body.removedMKId.map((mkId) => ({ kode: mkId })),
          connect: body.addedMKId.map((mkId) => ({ kode: mkId })),
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: BK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
