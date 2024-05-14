import prisma from "@/utils/prisma";

const updateMK = async (data) => {
  const penilaianCPMK = await prisma.penilaianCPMK.findUnique({
    where: {
      kode: data.PCPMKId,
    },
  });

  const MK = await prisma.MK.findUnique({
    where: {
      kode: penilaianCPMK.MK,
    },
    include: {
      mahasiswa: {
        include: { inputNilai: { include: { penilaianCPMK: true } } },
      },
    },
  });

  let totalLulusMK = 0;

  MK.mahasiswa.forEach((mahasiswa) => {
    const nilai = mahasiswa.inputNilai.filter(
      (nilai) => nilai.penilaianCPMK.MK === MK.kode
    );
    let totalNilai = 0;

    nilai.forEach((nilaiCPMK) => {
      nilaiCPMK.nilai.forEach((nilai, index) => {
        if (
          nilaiCPMK.penilaianCPMK.kriteria &&
          nilaiCPMK.penilaianCPMK.kriteria.length > index
        ) {
          totalNilai +=
            nilai * (nilaiCPMK.penilaianCPMK.kriteria[index].bobot / 100);
        } else {
          console.log("Invalid kriteria or index out of range");
        }
      });
    });

    console.log(mahasiswa.nama, "=", totalNilai);

    if (totalNilai >= MK.batasLulusMahasiswa) {
      totalLulusMK += 1;
    }
  });

  console.log("totalLulusMK = ", totalLulusMK);

  await prisma.MK.update({
    where: {
      kode: MK.kode,
    },
    data: {
      jumlahLulus: totalLulusMK,
    },
  });
};

export async function GET() {
  try {
    const inputNilai = await prisma.inputNilai.findMany({
      orderBy: { penilaianCPMKId: "asc" },
      include: { penilaianCPMK: true },
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
    
    updateMK(data);

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
