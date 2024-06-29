import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/rencanaPembelajaran/")[1];
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: rencanaPembelajaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/rencanaPembelajaran/")[1];
    const rencanaPembelajaran = await prisma.rencanaPembelajaran.delete({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: rencanaPembelajaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/rencanaPembelajaran/")[1];
    const data = await req.json();

    console.log(data);

    const rencanaPembelajaran = await prisma.rencanaPembelajaran.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: rencanaPembelajaran,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
