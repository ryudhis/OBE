import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/pl/")[1];
    const PL = await prisma.PL.findUnique({
      where: {
        id: parseInt(id),
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
    const id = req.url.split("/pl/")[1];
    const PL = await prisma.PL.delete({
      where: {
        id: parseInt(id),
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
    const id = req.url.split("/pl/")[1];
    const data = await req.json();

    const PL = await prisma.PL.update({
      where: {
        id: parseInt(id),
      },
      data,
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
