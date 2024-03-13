import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = parseInt(req.url.split("/bk/")[1]);
    const BK = await prisma.BK.findUnique({
      where: {
        id: id,
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
    const id = parseInt(req.url.split("/bk/")[1]);
    const BK = await prisma.BK.delete({
      where: {
        id: id,
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
    const id = parseInt(req.url.split("/bk/")[1]);
    const data = await req.json();

    const BK = await prisma.BK.update({
      where: {
        id: id,
      },
      data,
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