import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/bk/")[1];
    const BK = await prisma.BK.findUnique({
      where: {
        kode: kode,
      },
      include: {
        CPL: {
          include: {
            PL: true,
            CPMK: true,
          },
        },
        MK: {
          include: {
            CPMK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: BK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/bk/")[1];
    const BK = await prisma.BK.delete({
      where: {
        kode: kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: BK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/bk/")[1];
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
        CPL: {
          disconnect: body.removedCPLId.map((cplId) => ({ kode: cplId })),
          connect: body.addedCPLId.map((cplId) => ({ kode: cplId })),
        },
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
