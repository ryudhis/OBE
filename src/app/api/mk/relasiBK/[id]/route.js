import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/relasiBK/")[1];
    const data = await req.json();

    const MK = await prisma.MK.update({
      where: {
        kode,
      },
      data: {
        BK: {
          disconnect: data.removedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: data.prodiId,
            },
          })),
          connect: data.addedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: data.prodiId,
            },
          })),
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
    return Response.json({ status: 400, message: "Gagal ubah data!" });
  }
}
