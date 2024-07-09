import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/account/")[1];
    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/account/")[1];
    const account = await prisma.account.delete({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/account/")[1];
    const data = await req.json();

    const account = await prisma.account.update({
      where: {
        id,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: account,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
