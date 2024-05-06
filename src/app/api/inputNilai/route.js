import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const inputNilai = await prisma.inputNilai.findMany({
      orderBy: { penilaianCPMKId: 'asc' },
      include: { penilaianCPMK },
    });

    return Response.json({
      status: 200,
      message: "Berhasil ambil semua data!",
      data: inputNilai,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const inputNilai = await prisma.inputNilai.create({
      data: {
        penilaianCPMK: {
          connect: {
            kode: data.PCPMKId,
          },
        },
        mahasiswa: {
          connect: {
            nim: data.MahasiswaId,
          },
        },
        nilai: data.nilai,
      },
    });

    return Response.json({
      status: 200,
      message: "Berhasil buat data!",
      data: inputNilai,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ status: 400, message: "Something went wrong!" });
  }
}
