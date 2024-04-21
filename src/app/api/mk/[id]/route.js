import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/mk/")[1];
    const MK = await prisma.MK.findUnique({
      where: {
        kode: kode,
      },
      include: { BK: { include: { CPL: true } }, CPMK: true },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/mk/")[1];
    const MK = await prisma.MK.delete({
      where: {
        kode: kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: MK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/mk/")[1];
    const data = await req.json();

    const MK = await prisma.MK.update({
      where: {
        kode,
      },
      data,
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
