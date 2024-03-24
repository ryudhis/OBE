import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/cpl/")[1];
    const CPL = await prisma.CPL.findUnique({
      where: {
        kode: kode,
      },
      include: { PL: true, 
        BK : {
          include : {
            MK : true
          }
        }, 
        CPMK: {
          include : {
            MK : true
          }
        } },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/cpl/")[1];
    const CPL = await prisma.CPL.delete({
      where: {
        kode: kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: CPL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/cpl/")[1];
    const body = await req.json();

    const CPL = await prisma.CPL.update({
      where: {
        kode,
      },
      data: {
        kode: body.kode,
        deskripsi: body.deskripsi,
        BK: {
          disconnect: body.removedBKId.map((bkId) => ({ kode: bkId })),
          connect: body.addedBKId.map((bkId) => ({ kode: bkId })),
        },
        CPMK: {
          disconnect: body.removedCPMKId.map((cpmkId) => ({ kode: cpmkId })),
          connect: body.addedCPMKId.map((cpmkId) => ({ kode: cpmkId })),
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
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
