import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const kode = req.url.split("/penilaianCPMK/")[1];
    const penilaianCPMK = await prisma.penilaianCPMK.findUnique({
      where: {
        kode: kode,
      },
      include: { inputNilai: true },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const kode = req.url.split("/penilaianCPMK/")[1];
    const penilaianCPMK = await prisma.penilaianCPMK.delete({
      where: {
        kode: kode,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const kode = req.url.split("/penilaianCPMK/")[1];
    const data = await req.json();

    const penilaianCPMK = await prisma.penilaianCPMK.update({
      where: {
        kode,
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: penilaianCPMK,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
