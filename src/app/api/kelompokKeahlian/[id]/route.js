import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/kelompokKeahlian/")[1];
    const KK = await prisma.KK.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: KK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/kelompokKeahlian/")[1];
    const KK = await prisma.KK.delete({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: KK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/kelompokKeahlian/")[1];
    const data = await req.json();

    const KK = await prisma.KK.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: KK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
