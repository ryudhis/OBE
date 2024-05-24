import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const inputNilai = await prisma.inputNilai.findMany({
      orderBy: [
        { penilaianCPMKId: "asc" },
        { mahasiswaNim: "asc"},
      ],
      include: { penilaianCPMK: true, mahasiswa: true },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil ambil semua data!",
        data: inputNilai,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
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
        kelas: {
          connect: {
            id: data.kelasID,
          }
        },
        nilai: data.nilai,
      },
    });

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Berhasil buat data!",
        data: inputNilai,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ status: 400, message: "Something went wrong!" }),
      { status: 400 }
    );
  }
}
