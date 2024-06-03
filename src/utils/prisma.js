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

      const mahasiswaData = {
        nim: mahasiswa.nim,
        totalNilai: totalNilai.toFixed(2),
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
