import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient().$extends({
  name: "UpdateMKExtension", // Optional name for the extension
  query: {
    inputNilai: {
      async create({ args, query }) {
        const createdInputNilai = await query(args);

        const inputNilai = await prisma.inputNilai.findUnique({
          where: { id: createdInputNilai.id },
          include: { penilaianCPMK: true },
        });

        const MKId = inputNilai.penilaianCPMK.MKkode;
        const kelasId = inputNilai.kelasId;

        await updateMK({ MKId, kelasId });

        return createdInputNilai;
      },
      async createMany({ args, query }) {
        const createdInputNilaiArray = await query(args);

        if (createdInputNilaiArray.count > 0) {
          const firstInputNilai = await prisma.inputNilai.findFirst({
            where: {
              penilaianCPMKId: args.data[0].penilaianCPMKId,
              mahasiswaNim: args.data[0].mahasiswaNim,
            },
            include: { penilaianCPMK: true },
          });

          const MKId = firstInputNilai.penilaianCPMK.MKkode;
          const kelasId = firstInputNilai.kelasId;

          await updateMK({ MKId, kelasId });
        }

        return createdInputNilaiArray;
      },
      async update({ args, query }) {
        const updatedInputNilai = await query(args);

        const inputNilai = await prisma.inputNilai.findUnique({
          where: { id: updatedInputNilai.id },
          include: {
            penilaianCPMK: true,
            mahasiswa: true,
            kelas: true,
          },
        });

        const MKId = inputNilai.penilaianCPMK.MKkode;
        const kelasId = inputNilai.kelasId;

        await updateMK({ MKId, kelasId });

        return updatedInputNilai;
      },
      async updateMany({ args, query }) {
        const updatedInputNilaiArray = await query(args);

        if (updatedInputNilaiArray.count > 0) {
          const firstInputNilai = await prisma.inputNilai.findFirst({
            where: {
              penilaianCPMKId: args.where.penilaianCPMKId,
              mahasiswaNim: args.where.mahasiswaNim,
            },
            include: { penilaianCPMK: true },
          });

          const MKId = firstInputNilai.penilaianCPMK.MKkode;
          const kelasId = firstInputNilai.kelasId;

          await updateMK({ MKId, kelasId });
        }

        return updatedInputNilaiArray;
      },
      async delete({ args, query }) {
        const deletedInputNilai = await query(args);

        const penilaianCPMK = await prisma.penilaianCPMK.findUnique({
          where: { kode: deletedInputNilai.penilaianCPMKId },
        });

        const MKId = penilaianCPMK.MKkode;
        const kelasId = deletedInputNilai.kelasId;

        await updateMK({ MKId, kelasId });

        return deletedInputNilai;
      },
      async deleteMany({ args, query }) {
        const deletedInputNilaiArray = await query(args);

        if (deletedInputNilaiArray.count > 0) {
          const firstInputNilai = await prisma.inputNilai.findFirst({
            where: {
              penilaianCPMKId: args.where.penilaianCPMKId,
              mahasiswaNim: args.where.mahasiswaNim,
            },
            include: { penilaianCPMK: true },
          });

          const MKId = firstInputNilai.penilaianCPMK.MKkode;
          const kelasId = firstInputNilai.kelasId;

          await updateMK({ MKId, kelasId });
        }

        return deletedInputNilaiArray;
      },
    },
  },
});

const updateMK = async (data) => {
  try {
    console.log(data);

    const MK = await prisma.MK.findUnique({
      where: {
        kode: data.MKId,
      },
      include: {
        penilaianCPMK: true,
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

    const selectedKelas = await prisma.kelas.findUnique({
      where: {
        id: data.kelasId,
      },
      include: {
        mahasiswa: true,
      },
    });

    if (!selectedKelas) {
      throw new Error("Selected class not found");
    }

    let mahasiswaLulus = [];
    let dataCPMK = [];
    let rataCPMK = [];

    for (const pcpmk of MK.penilaianCPMK) {
      dataCPMK.push({
        cpmk: pcpmk.CPMKkode,
        cpl: pcpmk.CPLkode,
        nilaiMinimal: pcpmk.batasNilai,
        nilaiMasuk: 0,
        jumlahLulus: 0,
        persenLulus: 0,
        rataNilai: 0,
      });
      rataCPMK.push({
        nilai: 0,
      });
    }

    console.log("data CPMK :", dataCPMK);

    for (const mahasiswa of selectedKelas.mahasiswa) {
      const relevantNilai = await prisma.inputNilai.findMany({
        where: {
          penilaianCPMK: {
            MKkode: MK.kode,
          },
          mahasiswaNim: mahasiswa.nim,
        },
        include: { penilaianCPMK: true },
      });

      let totalNilai = 0;
      let statusCPMK = [];
      let nilaiMahasiswa = [];

      for (const nilaiCPMK of relevantNilai) {
        const indexCPMK = dataCPMK.findIndex(
          (data) => data.cpmk === nilaiCPMK.penilaianCPMK.CPMKkode
        );

        dataCPMK[indexCPMK].nilaiMasuk += 1;

        let totalNilaiCPMK = 0;
        let totalBobot = 0;
        let rataNilai = 0;
        let daftarNilai = {
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMKkode,
          batasNilai: nilaiCPMK.penilaianCPMK.batasNilai,
          nilai: [],
        };

        for (let i = 0; i < nilaiCPMK.nilai.length; i++) {
          const kriteria = nilaiCPMK.penilaianCPMK.kriteria;
          if (kriteria && kriteria.length > i) {
            totalNilaiCPMK += nilaiCPMK.nilai[i] * (kriteria[i].bobot / 100);
            totalBobot += kriteria[i].bobot;
            totalNilai += nilaiCPMK.nilai[i] * (kriteria[i].bobot / 100);
            rataNilai += nilaiCPMK.nilai[i];
            daftarNilai.nilai.push(nilaiCPMK.nilai[i]);
          } else {
            console.log(
              "Invalid kriteria or index out of range for",
              mahasiswa.nama
            );
          }
        }

        rataCPMK[indexCPMK].nilai += rataNilai / nilaiCPMK.nilai.length;

        // Update total lulus CPMK
        if (
          totalNilaiCPMK >=
          nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
        ) {
          dataCPMK[indexCPMK].jumlahLulus += 1;
        }

        nilaiMahasiswa.push(daftarNilai);

        statusCPMK.push({
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMKkode,
          nilaiCPMK: totalNilaiCPMK.toFixed(2),
          statusLulus:
            totalNilaiCPMK >=
            nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
              ? "Lulus"
              : "Tidak Lulus",
        });
      }

      const statusLulus =
        totalNilai >= MK.batasLulusMahasiswa ? "Lulus" : "Tidak Lulus";

      let indexNilai;

      if (totalNilai <= 40) {
        indexNilai = "E";
      } else if (totalNilai <= 50) {
        indexNilai = "D";
      } else if (totalNilai <= 60) {
        indexNilai = "C";
      } else if (totalNilai <= 65) {
        indexNilai = "BC";
      } else if (totalNilai <= 70) {
        indexNilai = "B";
      } else if (totalNilai <= 80) {
        indexNilai = "AB";
      } else {
        indexNilai = "A";
      }

      const mahasiswaData = {
        nim: mahasiswa.nim,
        totalNilai: totalNilai.toFixed(2),
        indexNilai: indexNilai,
        nilaiMahasiswa: nilaiMahasiswa,
        statusLulus: statusLulus,
        statusCPMK: statusCPMK,
      };

      console.log("daftarNilai = ", mahasiswaData.nilaiMahasiswa);
      console.log("statusCPMK = ", mahasiswaData.statusCPMK);

      mahasiswaLulus.push(mahasiswaData);

      console.log(mahasiswa.nama, "=", totalNilai);

      if (totalNilai >= MK.batasLulusMahasiswa) {
        totalLulusKelas += 1;
      }
    }

    for (let i = 0; i < dataCPMK.length; i++) {
      dataCPMK[i].persenLulus = (
        dataCPMK[i].jumlahLulus /
        (selectedKelas.mahasiswa.length / 100)
      ).toFixed(2);
      dataCPMK[i].rataNilai = (
        rataCPMK[i].nilai / dataCPMK[i].nilaiMasuk
      ).toFixed(2);
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
        dataCPMK: dataCPMK,
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
