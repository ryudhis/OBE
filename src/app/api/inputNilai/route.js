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
      let statusCPMK = [];

      for (const nilaiCPMK of relevantNilai) {
        let totalNilaiCPMK = 0;
        let totalBobot = 0;
        for (let i = 0; i < nilaiCPMK.nilai.length; i++) {
          const kriteria = nilaiCPMK.penilaianCPMK.kriteria;
          if (kriteria && kriteria.length > i) {
            totalNilaiCPMK += nilaiCPMK.nilai[i] * (kriteria[i].bobot / 100);
            totalBobot += kriteria[i].bobot;
            totalNilai += nilaiCPMK.nilai[i] * (kriteria[i].bobot / 100);
          } else {  
            console.log(
              "Invalid kriteria or index out of range for",
              mahasiswa.nama
            );
          }
        }
        statusCPMK.push({
          namaCPMK : nilaiCPMK.penilaianCPMK.CPMK,
          nilaiCPMK : totalNilaiCPMK,
          statusLulus : totalNilaiCPMK>=(nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100))?"Lulus":"Tidak Lulus",
        });
      }

      const statusLulus = totalNilai>=MK.batasLulusMahasiswa?"Lulus":"Tidak Lulus";

      const mahasiswaData = {
        nim: mahasiswa.nim,
        totalNilai: totalNilai,
        statusLulus: statusLulus,
        statusCPMK: statusCPMK,
      }

      console.log("statusCPMK = ", mahasiswaData.statusCPMK)

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
    for (const kelas of MK.kelas) {
      totalLulusMK+=kelas.jumlahLulus;
    }

    console.log("total lulus MK : ",totalLulusMK);

    await prisma.MK.update({
      where: {
        kode: MK.kode,
      },
      data: {
        jumlahLulus: totalLulusMK,
      },
    });
    
  } catch (error) {
    console.error("Error updating MK:", error);
  }
};

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
