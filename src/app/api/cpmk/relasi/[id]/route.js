import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const id = req.url.split("/relasi/")[1];
    const body = await req.json();

    const CPMK = await prisma.CPMK.update({
      where: {
        id: parseInt(id),
      },
      data: {
        id: body.id,
        deskripsi: body.deskripsi,
        MK: {
          disconnect: body.removedMKId.map((mkId) => ({ kode: mkId })),
          connect: body.addedMKId.map((mkId) => ({ kode: mkId })),
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
