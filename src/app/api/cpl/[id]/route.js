import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = parseInt(req.url.split("/cpl/")[1]);
    const cpl = await prisma.cpl.findUnique({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: cpl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = parseInt(req.url.split("/cpl/")[1]);
    const cpl = await prisma.cpl.delete({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: cpl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = parseInt(req.url.split("/cpl/")[1]);
    const data = await req.json();

    const cpl = await prisma.cpl.update({
      where: {
        id: id,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: cpl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}