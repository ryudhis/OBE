import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/cpmk/")[1];
    const CPMK = await prisma.CPMK.findUnique({
      where: {
        kode: kode,
      },
      include: {
        CPL: {
          include: {
            PL: true,
            BK: true,
          },
        },
        MK: {
          include: {
            BK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = parseInt(req.url.split("/cpmk/")[1]);
    const CPMK = await prisma.CPMK.delete({
      where: {
        kode: kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: CPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = parseInt(req.url.split("/cpmk/")[1]);
    const data = await req.json();

    const CPMK = await prisma.CPMK.update({
      where: {
        kode: kode,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: {
        ...data,
        CPL: {
          connect: data.CPL.map((cplId) => ({ kode: cplId })),
        },
        MK: {
          connect: data.MK.map((mkId) => ({ kode: mkId })),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
