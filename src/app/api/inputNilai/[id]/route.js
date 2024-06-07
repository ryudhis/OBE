import prisma from "@/utils/prisma";

export async function GET(req) {
  try {
    const id = req.url.split("/inputNilai/")[1];
    const inputNilai = await prisma.inputNilai.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        penilaianCPMK:true, mahasiswa:true, kelas:true,
      }
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil data!",
      data: inputNilai,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const id = req.url.split("/inputNilai/")[1];
    const inputNilai = await prisma.inputNilai.delete({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil hapus data!",
      data: inputNilai,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function PATCH(req) {
  try {
    const id = req.url.split("/inputNilai/")[1];
    const data = await req.json();

    const inputNilai = await prisma.inputNilai.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    return Response.json({
      status: 200,
      message: "Berhasil ubah data!",
      data: inputNilai,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
