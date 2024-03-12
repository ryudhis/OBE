import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = parseInt(req.url.split("/mk/")[1]);
    const mk = await prisma.mk.findUnique({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: mk,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = parseInt(req.url.split("/mk/")[1]);
    const mk = await prisma.mk.delete({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: mk,
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

    const mk = await prisma.mk.update({
      where: {
        id: id,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: mk,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}