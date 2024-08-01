import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/relasiCPMK/")[1];
    const data = await req.json();

    console.log(kode);

    const MK = await prisma.MK.update({
      where: {
        kode,
      },
      data: {
        CPMK: {
          disconnect: data.removedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
              prodiId: data.prodiId,
            },
          })),
          connect: data.addedCPMKId.map((cpmkId) => ({
            kode_prodiId: {
              kode: cpmkId,
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
