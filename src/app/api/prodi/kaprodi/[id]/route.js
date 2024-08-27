import prisma from "@/utils/prisma";

export async function PATCH(req) {
  try {
    const kode = req.url.split("/kaprodi/")[1];
    const data = await req.json();

    await prisma.account.update({
      where: {
        id: data.oldKaprodi,
      },
      data: {
        role: "Dosen",
      },
    });

    const prodi = await prisma.prodi.update({
      where: {
        kode,
      },
      data: {
        kaprodi: {
          connect: {
            id: data.kaprodi,
          },
        },
      },
    });

    await prisma.account.update({
      where: {
        id: data.kaprodi,
      },
      data: {
        role: "Kaprodi",
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: prodi,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
