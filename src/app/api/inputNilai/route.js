import prisma from "@/utils/prisma";

const updateMK = async (data) => {
  try {
    const MK = await prisma.MK.findUnique({
      where: {
        kode: data.MKId,
      },
      include: {
        kelas: {
          include: {
            mahasiswa: {
              include: { inputNilai: { include: { penilaianCPMK: true } } },
            },
          },
        },
      },
    });

    if (!MK) {
      throw new Error("MK not found");
    }

    let totalLulusKelas = 0;

    const selectedKelas = MK.kelas.find((kelas) => kelas.nama === data.kelasNama);

    if (!selectedKelas) {
      throw new Error("Selected class not found");
    }

    let mahasiswaLulus = [];

    for (const mahasiswa of selectedKelas.mahasiswa) {
      const relevantNilai = mahasiswa.inputNilai.filter(
        (nilai) => nilai.penilaianCPMK.MK === MK.kode
      );

      let totalNilai = 0;

      for (const nilaiCPMK of relevantNilai) {
        for (let i = 0; i < nilaiCPMK.nilai.length; i++) {
          const kriteria = nilaiCPMK.penilaianCPMK.kriteria;

          if (kriteria && kriteria.length > i) {
            totalNilai += nilaiCPMK.nilai[i] * (kriteria[i].bobot / 100);
          } else {
            console.log(
              "Invalid kriteria or index out of range for",
              mahasiswa.nama
            );
          }
        }
      }

      const mahasiswaData = {
        nim: mahasiswa.nim,
        totalNilai: totalNilai,
      }

      mahasiswaLulus.push(mahasiswaData);

      console.log(mahasiswa.nama, "=", totalNilai);

      if (totalNilai >= MK.batasLulusMahasiswa) {
        totalLulusKelas += 1;
      }
    }

    console.log("totalLulusKelas = ", totalLulusKelas);

    console.log("Mahasiswa Lulus = ", mahasiswaLulus);

    await prisma.kelas.update({
      where: {
        id: selectedKelas.id,
      },
      data: {
        jumlahLulus: totalLulusKelas,
        mahasiswaLulus: mahasiswaLulus,
      },
    });

    let totalLulusMK = 0;    
    
  } catch (error) {
    console.error("Error updating MK:", error);
  }
};

export async function GET() {
  try {
    const inputNilai = await prisma.inputNilai.findMany({
      orderBy: { penilaianCPMKId: "asc" },
      include: { penilaianCPMK: true },
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
        nilai: data.nilai,
      },
    });

    await updateMK(data);

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
