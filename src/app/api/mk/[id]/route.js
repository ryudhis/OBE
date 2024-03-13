import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = parseInt(req.url.split("/mk/")[1]);
    const MK = await prisma.MK.findUnique({
      where: {
        id: id,
      },
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
    const id = parseInt(req.url.split("/mk/")[1]);
    const MK = await prisma.MK.delete({
      where: {
        id: id,
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
    const id = parseInt(req.url.split("/mk/")[1]);
    const data = await req.json();

    const MK = await prisma.MK.update({
      where: {
        id: id,
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