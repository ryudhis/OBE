import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    console.log(body);

    const PL = await prisma.PL.update({
      where: {
        id: parseInt(id),
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        CPL: {
          disconnect: body.removedCPLId.map((cplId) => ({
            kode_prodiId: {
              kode: cplId,
              prodiId: body.prodiId,
            },
          })),
          connect: body.addedCPLId.map((cplId) => ({
            kode_prodiId: {
              kode: cplId,
              prodiId: body.prodiId,
            },
          })),
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
