import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/mk/")[1];
    const data = await req.json();

    const MK = await prisma.MK.update({
      where: {
        kode: kode,
      },
      data: {
        ...data,
        BK: {
          connect: data.BK.map((bkId) => ({ kode: bkId })),
        },
        CPMK: {
          connect: data.CPMK.map((cpmkId) => ({ kode: cpmkId })),
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
