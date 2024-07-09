import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    const CPL = await prisma.CPL.update({
      where: {
        id: parseInt(id),
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        BK: {
          disconnect: body.removedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: body.prodiId,
            },
          })),
          connect: body.addedBKId.map((bkId) => ({
            kode_prodiId: {
              kode: bkId,
              prodiId: body.prodiId,
            },
          })),
        },
        CPMK: {
          disconnect: body.removedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
              prodiId: body.prodiId,
            },
          })),
          connect: body.addedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
              prodiId: body.prodiId,
            },
          })),
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Gagal ubah data!" });
  }
}
