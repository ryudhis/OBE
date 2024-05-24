import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient().$extends({
  name: 'UpdateMKExtension', // Optional name for the extension
  query: {
    inputNilai: {
      async create({ args, query }) {
        const createdInputNilai = await query(args);

        const inputNilai = await prisma.inputNilai.findUnique({
          where: {
            kode: data.createdInputNilai.id,
          },
          include: {
            penilaianCPMK: true, mahasiswa: true,
          },
        });

        // Custom logic to update MK
        const MKId = inputNilai.penilaianCPMK.kode;
        const kelasNama = inputNilai.mahasiswa.kelasNama;

        console.log(MKId, kelasNama);
        await updateMK({ MKId, kelasNama });

        return createdInputNilai;
      },
      async delete({ args, query }) {
        const deletedInputNilai = await query(args);

        // Custom logic to update MK
        const MKId = deletedInputNilai.penilaianCPMK.kode;
        const kelasNama = deletedInputNilai.mahasiswa.kelasNama;
        await updateMK({ MKId, kelasNama });

        return deletedInputNilai;
      },
      async deleteMany({ args, query }) {
        const deletedInputNilai = await query(args);

        // Custom logic to update MK for each deleted inputNilai
        for (const inputNilai of deletedInputNilai) {
          const MKId = inputNilai.penilaianCPMK.kode;
          const kelasNama = inputNilai.mahasiswa.kelasNama;
          await updateMK({ MKId, kelasNama });
        }

        return deletedInputNilai;
      },
      async update({ args, query }) {
        const updatedInputNilai = await query(args);

        // Custom logic to update MK
        const MKId = updatedInputNilai.penilaianCPMK.kode;
        const kelasNama = updatedInputNilai.mahasiswa.kelasNama;
        await updateMK({ MKId, kelasNama });

        return updatedInputNilai;
      },
      async updateMany({ args, query }) {
        const updatedInputNilai = await query(args);

        // Custom logic to update MK for each updated inputNilai
        for (const inputNilai of updatedInputNilai) {
          const MKId = inputNilai.penilaianCPMK.kode;
          const kelasNama = inputNilai.mahasiswa.kelasNama;
          await updateMK({ MKId, kelasNama });
        }

        return updatedInputNilai;
      },
    },
  },
});

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

    const selectedKelas = MK.kelas.find(
      (kelas) => kelas.nama === data.kelasNama
    );

    if (!selectedKelas) {
      throw new Error("Selected class not found");
    }

    let mahasiswaLulus = [];

    for (const mahasiswa of selectedKelas.mahasiswa) {
      const relevantNilai = await prisma.inputNilai.findMany({
        where: {
          penilaianCPMK: {
            MK: MK.kode,
          },
          mahasiswaId: mahasiswa.id,
        },
        include: { penilaianCPMK: true },
      });

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
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK,
          nilaiCPMK: totalNilaiCPMK,
          statusLulus:
            totalNilaiCPMK >=
            nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
              ? "Lulus"
              : "Tidak Lulus",
        });
      }

      const statusLulus =
        totalNilai >= MK.batasLulusMahasiswa ? "Lulus" : "Tidak Lulus";

      const mahasiswaData = {
        nim: mahasiswa.nim,
        totalNilai: totalNilai,
        statusLulus: statusLulus,
        statusCPMK: statusCPMK,
      };

      console.log("statusCPMK = ", mahasiswaData.statusCPMK);

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
      totalLulusMK += kelas.jumlahLulus;
    }

    console.log("total lulus MK : ", totalLulusMK);

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

export default prisma;