import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const PL = await prisma.PL.findUnique({
      where: {
        kode,
      },
      include: {
        CPL: {
          include: {
            BK: true,
            CPMK: true,
          },
        },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const PL = await prisma.PL.delete({
      where: {
        kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: PL,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/pl/")[1];
    const data = await req.json();

    const PL = await prisma.PL.update({
      where: {
        kode,
      },
      data: {
        ...data,
        CPL: {
          connect: data.CPL.map((cplId) => ({ kode: cplId })),
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
