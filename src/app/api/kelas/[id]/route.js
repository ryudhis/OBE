import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/kelas/")[1];
    const kelas = await prisma.kelas.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        MK: {include : {CPMK: true, penilaianCPMK: true}},
        mahasiswa: { include: { kelas: true, inputNilai: {
          include: {
            penilaianCPMK: true,
          }
        } } },
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: kelas,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/kelas/")[1];
    const kelas = await prisma.kelas.delete({
      where: {
        id,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: kelas,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/kelas/")[1];
    const data = await req.json();

    const kelas = await prisma.kelas.update({
      where: {
        id,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: kelas,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
