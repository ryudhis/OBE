import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/tahunAjaran/")[1];
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: {
        id:parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: tahunAjaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/tahun-ajaran/")[1];
    const tahunAjaran = await prisma.tahunAjaran.delete({
      where: {
        id:parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: tahunAjaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/tahunAjaran/")[1];
    const data = await req.json();

    const tahunAjaran = await prisma.tahunAjaran.update({
      where: {
        id:parseInt(id),
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: tahunAjaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
