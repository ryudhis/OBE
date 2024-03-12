import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = parseInt(req.url.split("/pl/")[1]);
    const pl = await prisma.pl.findUnique({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: pl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = parseInt(req.url.split("/pl/")[1]);
    const pl = await prisma.pl.delete({
      where: {
        id: id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: pl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = parseInt(req.url.split("/pl/")[1]);
    const data = await req.json();

    const pl = await prisma.pl.update({
      where: {
        id: id,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: pl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}