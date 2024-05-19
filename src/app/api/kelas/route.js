import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const kelas = await prisma.kelas.findMany();

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: kelas,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const jumlahKelas = Math.max(1, Math.min(data.jumlahKelas, 4));   
    const namaBase = 'R';
    
    for (let i = 0; i < jumlahKelas; i++) {
      const nama = jumlahKelas === 1 ? namaBase : `${namaBase}${String.fromCharCode(65 + i)}`;
      await prisma.kelas.create({
        data: {
          nama: nama,
          jumlahLulus: 0,
          MK: {
            connect: {
              kode: data.MKId,
            }
          },
        },
      });
    }

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: null,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function DELETE(req) {
  try {
    const data = await req.json();

    const result = await prisma.kelas.deleteMany({
      where: {
        MKId: data.MKId,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil menghapus data!",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
