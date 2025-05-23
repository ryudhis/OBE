import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "development") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}

const prismaExtended = prisma.$extends({
  name: "UpdateDataExtension",
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

        await updateKelas({ MKId, kelasId, context: {} });

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

          await updateKelas({ MKId, kelasId, context: {} });
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

        await updateKelas({ MKId, kelasId, context: {} });

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

          await updateKelas({ MKId, kelasId, context: {} });
        }
        return updatedInputNilaiArray;
      },
      async delete({ args, query }) {
        const deletedInputNilai = await query(args);

        const penilaianCPMK = await prisma.penilaianCPMK.findUnique({
          where: { id: deletedInputNilai.penilaianCPMKId },
        });

        const MKId = penilaianCPMK.MKkode;
        const kelasId = deletedInputNilai.kelasId;

        await updateKelas({ MKId, kelasId, context: {} });

        return deletedInputNilai;
      },
      async deleteMany({ args, query }) {
        const deletedInputNilaiArray = await query(args);
        console.log("deletedInputNilai :", deletedInputNilaiArray);

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

          await updateKelas({ MKId, kelasId, context: {} });
        }

        return deletedInputNilaiArray;
      },
    },
    kelas: {
      async update({ args, query }) {
        const updatedKelas = await query(args);

        const MKId = updatedKelas.MKId;
        const kelasId = updatedKelas.id;

        await updateKelas({ MKId, kelasId });

        return updatedKelas;
      },
      async delete({ args, query }) {
        const deletedKelas = await query(args);

        const MKId = deletedKelas.MKId;
        const tahunAjaranId = deletedKelas.tahunAjaranId;

        await updateMK(MKId, tahunAjaranId);

        return deletedKelas;
      },
    },
    mK: {
      async delete({ args, query }) {
        // Fetch the MK record with related kelas before deleting
        const MKtoDelete = await prisma.MK.findUnique({
          where: {
            kode: args.where.kode,
          },
          include: {
            kelas: {
              include: {
                tahunAjaran: true,
              },
            },
            CPMK: {
              include: {
                CPL: {
                  include: {
                    CPMK: true,
                  },
                },
              },
            },
            penilaianCPMK: true,
          },
        });

        if (!MKtoDelete) {
          throw new Error(`MK with kode ${args.where.kode} not found`);
        }

        console.log(MKtoDelete);

        // Extract necessary information from the related kelas
        const kelasInMK = MKtoDelete.kelas;
        const tahunAjaranIds = [
          ...new Set(kelasInMK.map((kelas) => kelas.tahunAjaranId)),
        ];

        console.log(tahunAjaranIds);

        // Perform the delete operation
        const deletedMK = await query(args);
        console.log("deletedMK :", deletedMK);

        //updateCPMK
        for (const tahunAjaranId of tahunAjaranIds) {
          await updateCPMK(MKtoDelete, tahunAjaranId);
        }

        return deletedMK;
      },
    },
    cPMK: {
      async delete({ args, query }) {
        // Fetch the CPMK record with related CPL before deleting
        const CPMKtoDelete = await prisma.CPMK.findUnique({
          where: {
            id: args.where.id,
          },
          include: {
            CPL: {
              include: {
                CPMK: true,
              },
            },
          },
        });

        if (!CPMKtoDelete) {
          throw new Error(`CPMK with id ${args.where.id} not found`);
        }

        // Perform the delete operation
        const deletedCPMK = await query(args);
        console.log("deletedCPMK :", deletedCPMK);

        const CPMKIds = CPMKtoDelete.CPL.CPMK.map((cpmk) => cpmk.id);

        // Fetch all related lulusCPMK records
        const lulusCPMK = await prisma.lulusCPMK.findMany({
          where: {
            CPMKId: {
              in: CPMKIds,
            },
          },
          select: {
            jumlahLulus: true,
            CPMKId: true,
            tahunAjaranId: true,
          },
        });

        // Group the lulusCPMK records by tahunAjaranId
        const groupedLulusCPMK = lulusCPMK.reduce((groups, entry) => {
          const { tahunAjaranId } = entry;
          if (!groups[tahunAjaranId]) {
            groups[tahunAjaranId] = [];
          }
          groups[tahunAjaranId].push(entry);
          return groups;
        }, {});

        const cpl = CPMKtoDelete.CPL;
        const cplId = cpl.id;

        // Iterate over each tahunAjaranId group to handle performaCPL updates
        for (const tahunAjaranId in groupedLulusCPMK) {
          const lulusCPMKGroup = groupedLulusCPMK[tahunAjaranId];

          // Filter relatedLulusCPMK for this tahunAjaranId group
          const relatedLulusCPMK = lulusCPMKGroup.filter((entry) =>
            cpl.CPMK.some((cpmk) => cpmk.id === entry.CPMKId)
          );

          console.log(
            "CPL = ",
            cplId,
            "tahunAjaranId = ",
            tahunAjaranId,
            "relatedLulusCPMK = ",
            relatedLulusCPMK
          );

          if (relatedLulusCPMK.length === 0) {
            // If no related lulusCPMK for this tahunAjaranId, delete the performaCPL for that year
            await prisma.performaCPL.delete({
              where: {
                CPLId_tahunAjaranId: {
                  CPLId: cplId,
                  tahunAjaranId: parseInt(tahunAjaranId), // Ensure tahunAjaranId is an integer
                },
              },
            });
          } else {
            // Calculate totalJumlahLulus for this tahunAjaranId group
            const totalJumlahLulus = relatedLulusCPMK.reduce(
              (sum, entry) => sum + entry.jumlahLulus,
              0
            );

            console.log(
              "totalJumlahLulus for tahunAjaranId = ",
              tahunAjaranId,
              " = ",
              totalJumlahLulus
            );

            const numberOfCPMK = cpl.CPMK.length;

            // Calculate performa
            const performa =
              numberOfCPMK > 0 ? totalJumlahLulus / numberOfCPMK : 0;

            console.log(
              "performa for tahunAjaranId = ",
              tahunAjaranId,
              " = ",
              performa
            );

            // Upsert performaCPL for this tahunAjaranId
            await prisma.performaCPL.upsert({
              where: {
                CPLId_tahunAjaranId: {
                  CPLId: cplId,
                  tahunAjaranId: parseInt(tahunAjaranId),
                },
              },
              update: {
                performa: performa,
              },
              create: {
                performa: performa,
                CPLId: cplId,
                tahunAjaranId: parseInt(tahunAjaranId),
              },
            });
          }
        }
        return deletedCPMK;
      },
    },
  },
});

let isUpdatingKelas = false; // Flag to prevent recursive updates

const updateKelas = async (data) => {
  if (isUpdatingKelas) {
    return;
  }

  // Set the flag to indicate the update is in progress
  isUpdatingKelas = true;

  try {
    const MK = await prisma.MK.findUnique({
      where: {
        kode: data.MKId,
      },
      include: {
        penilaianCPMK: { include: { CPMK: true, CPL: true } },
        kelas: {
          include: {
            mahasiswa: {
              include: {
                inputNilai: {
                  include: {
                    penilaianCPMK: true,
                  },
                },
              },
            },
          },
        },
        CPMK: {
          include: {
            MK: {
              include: {
                kelas: true,
              },
            },
            CPL: {
              include: {
                CPMK: true,
              },
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
        tahunAjaran: true,
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
        cpmkId: pcpmk.CPMK.id,
        cpmk: pcpmk.CPMK.kode,
        cplId: pcpmk.CPL.id,
        cpl: pcpmk.CPL.kode,
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

    // console.log("data CPMK :", dataCPMK);

    for (const mahasiswa of selectedKelas.mahasiswa) {
      const relevantNilai = await prisma.inputNilai.findMany({
        where: {
          penilaianCPMK: {
            MKkode: MK.kode,
          },
          mahasiswaNim: mahasiswa.nim,
        },
        include: {
          penilaianCPMK: {
            include: {
              CPMK: true,
              CPL: true,
            },
          },
        },
      });

      let totalNilai = 0;
      let statusCPMK = [];
      let nilaiMahasiswa = [];

      for (const nilaiCPMK of relevantNilai) {
        const indexCPMK = dataCPMK.findIndex(
          (data) => data.cpmk === nilaiCPMK.penilaianCPMK.CPMK.kode
        );

        dataCPMK[indexCPMK].nilaiMasuk += 1;

        let totalNilaiCPMK = 0;
        let totalBobot = 0;
        let rataNilai = 0;
        let daftarNilai = {
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK.kode,
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

        // update performa MK_CPMK Mahasiswa
        await prisma.mahasiswa_MK_CPMK.upsert({
          where: {
            mahasiswaNim_MKId_CPMKId: {
              mahasiswaNim: mahasiswa.nim,
              MKId: selectedKelas.MKId,
              CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            },
          },
          create: {
            mahasiswaNim: mahasiswa.nim,
            MKId: selectedKelas.MKId,
            CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            nilai: parseFloat((rataNilai / nilaiCPMK.nilai.length).toFixed(2)),
          },
          update: {
            nilai: parseFloat((rataNilai / nilaiCPMK.nilai.length).toFixed(2)),
          },
        });

        // Update total lulus CPMK
        if (
          totalNilaiCPMK >=
          nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
        ) {
          dataCPMK[indexCPMK].jumlahLulus += 1;
        }

        await prisma.lulusKelas_CPMK.upsert({
          where: {
            kelasId_CPMKId_tahunAjaranId: {
              kelasId: selectedKelas.id,
              tahunAjaranId: selectedKelas.tahunAjaranId,
              CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            },
          },
          create: {
            kelasId: selectedKelas.id,
            tahunAjaranId: selectedKelas.tahunAjaranId,
            CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            jumlahLulus:
              dataCPMK[indexCPMK].jumlahLulus /
              (selectedKelas.mahasiswa.length / 100),
          },
          update: {
            jumlahLulus:
              dataCPMK[indexCPMK].jumlahLulus /
              (selectedKelas.mahasiswa.length / 100),
          },
        });

        // console.log(
        //   "persentase lulus CPMK = ",
        //   dataCPMK[indexCPMK].jumlahLulus /
        //     (selectedKelas.mahasiswa.length / 100)
        // );

        nilaiMahasiswa.push(daftarNilai);

        statusCPMK.push({
          nilaiId: nilaiCPMK.id,
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK.kode,
          nilaiCPMK: totalNilaiCPMK.toFixed(2),
          kriteria: nilaiCPMK.penilaianCPMK.kriteria.map((k) => k.kriteria),
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
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        totalNilai: totalNilai.toFixed(2),
        indexNilai: indexNilai,
        nilaiMahasiswa: nilaiMahasiswa,
        statusLulus: statusLulus,
        statusCPMK: statusCPMK,
      };

      await prisma.mahasiswa_MK.upsert({
        where: {
          mahasiswaNim_MKId: {
            mahasiswaNim: mahasiswa.nim,
            MKId: selectedKelas.MKId,
          },
        },
        create: {
          mahasiswaNim: mahasiswa.nim,
          MKId: selectedKelas.MKId,
          nilai: parseFloat(totalNilai.toFixed(2)),
        },
        update: {
          nilai: parseFloat(totalNilai.toFixed(2)),
        },
      });

      // console.log("daftarNilai = ", mahasiswaData.nilaiMahasiswa);
      // console.log("statusCPMK = ", mahasiswaData.statusCPMK);

      mahasiswaLulus.push(mahasiswaData);

      // console.log(mahasiswa.nama, "=", totalNilai);

      if (totalNilai >= MK.batasLulusMahasiswa) {
        totalLulusKelas += 1;
      }

      // Update performa CPMK Mahasiswa
      updatePerformaCPMKMahasiswa(mahasiswa.nim, MK);
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

    // console.log("totalLulusKelas = ", totalLulusKelas);

    // console.log("Mahasiswa Lulus = ", mahasiswaLulus);

    // Filter mahasiswa tidak lulus
    const mahasiswaPerbaikan = mahasiswaLulus
      .filter((mahasiswa) => mahasiswa.statusLulus === "Tidak Lulus")
      .map((mahasiswa) => ({
        ...mahasiswa,
        statusCPMK: mahasiswa.statusCPMK.filter(
          (cpmk) => cpmk.statusLulus === "Tidak Lulus"
        ),
      }));

    // console.log("Perbaikan: ", mahasiswaPerbaikan);

    const cplMap = {};

    dataCPMK.forEach((item) => {
      if (!cplMap[item.cpl]) {
        cplMap[item.cpl] = {
          cpl: item.cpl,
          cplId: item.cplId,
          persenLulusTotal: 0,
          rataNilaiTotal: 0,
          count: 0,
        };
      }

      // Ensure `persenLulus` and `rataNilai` are numbers and add them to totals
      cplMap[item.cpl].persenLulusTotal += Number(item.persenLulus) || 0;
      cplMap[item.cpl].rataNilaiTotal += Number(item.rataNilai) || 0;
      cplMap[item.cpl].count += 1;
    });

    // Calculate the average for `persenLulus` and `rataNilai` for each unique `cpl`
    const dataCPL = Object.values(cplMap).map((cplEntry) => ({
      cpl: cplEntry.cpl,
      cplId: cplEntry.cplId,
      persenLulus:
        cplEntry.count > 0
          ? (cplEntry.persenLulusTotal / cplEntry.count).toFixed(2)
          : 0,
      rataNilai:
        cplEntry.count > 0
          ? (cplEntry.rataNilaiTotal / cplEntry.count).toFixed(2)
          : 0,
    }));

    // console.log("dataCPL = ", dataCPL);

    await prisma.kelas.update({
      where: {
        id: selectedKelas.id,
      },
      data: {
        jumlahLulus: totalLulusKelas,
        mahasiswaLulus: mahasiswaLulus,
        mahasiswaPerbaikan: mahasiswaPerbaikan,
        dataCPMK: dataCPMK,
        dataCPL: dataCPL,
      },
    });

    //Update MK and PerformaCPL
    updateMK(MK.kode, selectedKelas.tahunAjaranId);
  } catch (error) {
    console.error("Error updating Kelas:", error);
  } finally {
    // Reset the flag after the update is complete
    isUpdatingKelas = false;
  }
};

const updateMK = async (MKId, tahunAjaranId) => {
  try {
    // Update MK
    let totalLulusMK = 0;

    const updatedMK = await prisma.MK.findUnique({
      where: {
        kode: MKId,
      },
      include: {
        kelas: {
          include: {
            tahunAjaran: true,
          },
        },
        CPMK: {
          include: {
            CPL: {
              include: {
                CPMK: true,
              },
            },
          },
        },
        penilaianCPMK: true,
      },
    });

    console.log("MK to update = ", updatedMK);

    for (const kelas of updatedMK.kelas) {
      totalLulusMK += kelas.jumlahLulus;
      console.log("kelas lulus= ", kelas.nama, "=", kelas.jumlahLulus);
    }

    console.log("total lulus MK : ", totalLulusMK);

    const totalMahasiswa = await prisma.mahasiswa.count({
      where: {
        kelas: {
          some: {
            MKId: MKId,
            tahunAjaranId: tahunAjaranId,
          },
        },
      },
    });

    console.log("total mahasiswa = ", totalMahasiswa);

    const persentaseLulus =
      totalMahasiswa > 0 ? totalLulusMK / totalMahasiswa : 0;

    await prisma.lulusMK.upsert({
      where: {
        MKId_tahunAjaranId: {
          MKId: MKId,
          tahunAjaranId: tahunAjaranId,
        },
      },
      create: {
        MKId: MKId,
        tahunAjaranId: tahunAjaranId,
        jumlahLulus: totalLulusMK,
        persentaseLulus: persentaseLulus * 100,
      },
      update: {
        jumlahLulus: totalLulusMK,
        persentaseLulus: persentaseLulus * 100,
      },
    });

    let kelasOfMK = updatedMK.kelas
      .filter((kelas) => kelas.tahunAjaranId === tahunAjaranId)
      .map((kelas) => kelas.id);

    const lulusKelas_CPMK = await prisma.lulusKelas_CPMK.findMany({
      where: {
        kelasId: {
          in: kelasOfMK,
        },
      },
      select: {
        jumlahLulus: true,
        CPMKId: true,
      },
    });

    console.log("lulus kelas CPMK : ", lulusKelas_CPMK);

    const dataLulusMK_CPMK = Object.entries(
      lulusKelas_CPMK.reduce((acc, curr) => {
        const { CPMKId, jumlahLulus } = curr;

        if (!acc[CPMKId]) {
          acc[CPMKId] = [];
        }

        acc[CPMKId].push(jumlahLulus);
        return acc;
      }, {})
    ).map(([CPMKId, jumlahLulusArray]) => ({
      CPMKId,
      jumlahLulus: jumlahLulusArray,
    }));

    console.log("dataLulusMK_CPMK : ", dataLulusMK_CPMK);

    const cpmkIds = updatedMK.penilaianCPMK.map((data) => {
      return data.CPMKkode;
    });

    console.log("CPMKIds = ", cpmkIds);

    // Extract CPMKIds present in dataLulusMK_CPMK
    const presentCPMKIds = dataLulusMK_CPMK.map((data) =>
      parseInt(data.CPMKId)
    );

    // Find CPMKIds that are in cpmkIds but not in presentCPMKIds
    const cpmkIdsToDelete = cpmkIds.filter(
      (id) => !presentCPMKIds.includes(id)
    );

    console.log("CPMKIds to delete = ", cpmkIdsToDelete);

    if (cpmkIdsToDelete.length > 0) {
      try {
        await prisma.lulusMK_CPMK.deleteMany({
          where: {
            MKId: MKId,
            tahunAjaranId: tahunAjaranId,
            CPMKId: {
              in: cpmkIdsToDelete,
            },
          },
        });
      } catch (error) {
        console.error("Error deleting records:", error);
      }
    }

    for (const data of dataLulusMK_CPMK) {
      const totalLulus = data.jumlahLulus.reduce((acc, curr) => acc + curr, 0);
      const averageLulus = totalLulus / data.jumlahLulus.length;

      console.log("average lulus =", averageLulus);

      await prisma.lulusMK_CPMK.upsert({
        where: {
          MKId_CPMKId_tahunAjaranId: {
            MKId: MKId,
            CPMKId: parseInt(data.CPMKId),
            tahunAjaranId: tahunAjaranId,
          },
        },
        update: {
          jumlahLulus: averageLulus,
        },
        create: {
          MKId: MKId,
          CPMKId: parseInt(data.CPMKId),
          tahunAjaranId: tahunAjaranId,
          jumlahLulus: averageLulus,
        },
      });
    }

    updateCPMK(updatedMK, tahunAjaranId);
  } catch (error) {
    console.error("Error updating MK:", error);
  }
};

const updateCPMK = async (updatedMK, tahunAjaranId) => {
  // Update CPMK
  try {
    const CPMKinMK = updatedMK.penilaianCPMK.map((pcpmk) => pcpmk.CPMKkode);

    console.log("CPMK in MK = ", CPMKinMK);

    const lulusMK_CPMK = await prisma.lulusMK_CPMK.findMany({
      where: {
        CPMKId: {
          in: CPMKinMK,
        },
        tahunAjaranId: tahunAjaranId,
      },
      select: {
        jumlahLulus: true,
        CPMKId: true,
      },
    });

    console.log("lulusMK_CPMK = ", lulusMK_CPMK);

    const dataLulusCPMK = Object.entries(
      lulusMK_CPMK.reduce((acc, curr) => {
        const { CPMKId, jumlahLulus } = curr;
        if (!acc[CPMKId]) {
          acc[CPMKId] = [];
        }
        acc[CPMKId].push(jumlahLulus);
        return acc;
      }, {})
    ).map(([CPMKId, jumlahLulusArray]) => ({
      CPMKId,
      jumlahLulus: jumlahLulusArray,
    }));

    console.log("dataLulusCPMK = ", dataLulusCPMK);

    // Extract CPMKIds present in dataLulusMK_CPMK
    const presentCPMKIds = dataLulusCPMK.map((data) => parseInt(data.CPMKId));

    // Find CPMKIds that are in cpmkIds but not in presentCPMKIds
    const cpmkIdsToDelete = CPMKinMK.filter(
      (id) => !presentCPMKIds.includes(id)
    );

    console.log("CPMKIds to delete = ", cpmkIdsToDelete);

    if (cpmkIdsToDelete.length > 0) {
      try {
        await prisma.lulusCPMK.deleteMany({
          where: {
            CPMKId: {
              in: cpmkIdsToDelete,
            },
            tahunAjaranId: tahunAjaranId,
          },
        });
      } catch (error) {
        console.error("Error deleting records:", error);
      }
    }

    dataLulusCPMK.forEach(async (data) => {
      const totalLulus = data.jumlahLulus.reduce((acc, curr) => acc + curr, 0);

      await prisma.lulusCPMK.upsert({
        where: {
          CPMKId_tahunAjaranId: {
            CPMKId: parseInt(data.CPMKId),
            tahunAjaranId: tahunAjaranId,
          },
        },
        update: { jumlahLulus: totalLulus / data.jumlahLulus.length },
        create: {
          CPMKId: parseInt(data.CPMKId),
          jumlahLulus: totalLulus / data.jumlahLulus.length,
          tahunAjaranId: tahunAjaranId,
        },
      });
    });

    updatePerformaCPL(updatedMK, tahunAjaranId);
  } catch (error) {
    console.error("Error updating CPMK:", error);
  }
};

const updatePerformaCPL = async (updatedMK, tahunAjaranId) => {
  // Update PerformaCPL
  try {
    const listCPL = [...new Set(updatedMK.CPMK.map((cpmk) => cpmk.CPL))];

    const CPLtoUpdate = listCPL.reduce((uniqueCPLs, currentCPL) => {
      const isDuplicate = uniqueCPLs.some((cpl) => cpl.id === currentCPL.id);
      if (!isDuplicate) {
        uniqueCPLs.push(currentCPL);
      }
      return uniqueCPLs;
    }, []);

    console.log("CPL to update = ", CPLtoUpdate);

    const cpmkIds = CPLtoUpdate.flatMap((cpl) =>
      cpl.CPMK.map((cpmk) => cpmk.id)
    );

    const lulusCPMK = await prisma.lulusCPMK.findMany({
      where: {
        CPMKId: {
          in: cpmkIds,
        },
        tahunAjaranId: tahunAjaranId,
      },
      select: {
        jumlahLulus: true,
        CPMKId: true,
      },
    });

    for (const cpl of CPLtoUpdate) {
      const cplId = cpl.id;
      const relatedLulusCPMK = lulusCPMK.filter((entry) =>
        cpl.CPMK.some((cpmk) => cpmk.id === entry.CPMKId)
      );

      console.log("CPL =", cplId, "relatedLulusCPMK =", relatedLulusCPMK);

      if (relatedLulusCPMK.length === 0) {
        try {
          await prisma.performaCPL.delete({
            where: {
              CPLId_tahunAjaranId: {
                CPLId: cplId,
                tahunAjaranId: tahunAjaranId,
              },
            },
          });
        } catch (error) {
          console.error("Error deleting PerformaCPL:", error);
        }
      } else {
        const totalJumlahLulus = relatedLulusCPMK.reduce(
          (sum, entry) => sum + entry.jumlahLulus,
          0
        );

        console.log("totalJumlahLulus = ", totalJumlahLulus);

        const numberOfCPMK = relatedLulusCPMK.length;

        const performa = numberOfCPMK > 0 ? totalJumlahLulus / numberOfCPMK : 0;

        console.log("performa = ", performa);

        // Upsert operation
        try {
          await prisma.performaCPL.upsert({
            where: {
              CPLId_tahunAjaranId: {
                CPLId: cplId,
                tahunAjaranId: tahunAjaranId,
              },
            },
            update: {
              performa: performa,
            },
            create: {
              performa: performa,
              CPLId: cplId,
              tahunAjaranId: tahunAjaranId,
            },
          });
        } catch (error) {
          console.error("Error upserting PerformaCPL:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error updating PerformaCPL:", error);
  }
};

const updatePerformaCPMKMahasiswa = async (nim, MK) => {
  const { penilaianCPMK } = MK;

  if (!penilaianCPMK || penilaianCPMK.length === 0) {
    console.log("No penilaianCPMK found for the given MK.");
    return;
  }

  // Extract all CPMKIds from penilaianCPMK
  const CPMKIds = penilaianCPMK.map((penilaian) => penilaian.CPMK.id);

  // Fetch all mahasiswa_MK_CPMK data where mahasiswaNim = nim and CPMKId in CPMKIds
  const mahasiswaMKCPMKData = await prisma.mahasiswa_MK_CPMK.findMany({
    where: {
      mahasiswaNim: nim,
      CPMKId: { in: CPMKIds },
    },
  });

  if (!mahasiswaMKCPMKData || mahasiswaMKCPMKData.length === 0) {
    console.log("No mahasiswa_MK_CPMK data found for the given conditions.");
    return;
  }

  // Group mahasiswa_MK_CPMK data by CPMKId
  const groupedData = mahasiswaMKCPMKData.reduce((acc, curr) => {
    if (!acc[curr.CPMKId]) {
      acc[curr.CPMKId] = [];
    }
    acc[curr.CPMKId].push(curr);
    return acc;
  }, {});

  // Iterate over each group, calculate the average nilai, and upsert into mahasiswa_CPMK
  for (const CPMKId in groupedData) {
    const group = groupedData[CPMKId];

    // Calculate the average nilai
    const totalNilai = group.reduce((sum, item) => sum + item.nilai, 0);
    const averageNilai = totalNilai / group.length;

    // Upsert into mahasiswa_CPMK
    await prisma.mahasiswa_CPMK.upsert({
      where: {
        mahasiswaNim_CPMKId: {
          mahasiswaNim: nim,
          CPMKId: parseInt(CPMKId), // Ensure CPMKId is an integer
        },
      },
      update: {
        nilai: parseFloat(averageNilai.toFixed(2)),
      },
      create: {
        mahasiswaNim: nim,
        CPMKId: parseInt(CPMKId), // Ensure CPMKId is an integer
        nilai: parseFloat(averageNilai.toFixed(2)),
      },
    });
  }

  console.log("Performa CPMK Mahasiswa updated successfully.");
  updatePerformaCPLMahasiswa(nim, MK);
};

const updatePerformaCPLMahasiswa = async (nim, MK) => {
  try {
    // Extract the list of unique CPLs from MK.CPMK
    const listCPL = [...new Set(MK.CPMK.map((cpmk) => cpmk.CPL))];

    // Ensure uniqueness of CPLs (in case there are duplicates in the list)
    const CPLtoUpdate = listCPL.reduce((uniqueCPLs, currentCPL) => {
      const isDuplicate = uniqueCPLs.some((cpl) => cpl.id === currentCPL.id);
      if (!isDuplicate) {
        uniqueCPLs.push(currentCPL);
      }
      return uniqueCPLs;
    }, []);

    console.log("CPL to update = ", CPLtoUpdate);

    // Get all relevant CPMK IDs from the CPL.CPMK arrays
    const relevantCPMKIds = CPLtoUpdate.flatMap((cpl) =>
      cpl.CPMK.map((cpmk) => cpmk.id)
    );

    // Get all mahasiswa_CPMK records for the given nim and relevant CPMKIds
    const mahasiswaCPMKData = await prisma.mahasiswa_CPMK.findMany({
      where: {
        mahasiswaNim: nim,
        CPMKId: {
          in: relevantCPMKIds, // Only fetch mahasiswa_CPMK records for relevant CPMKIds
        },
      },
    });

    if (!mahasiswaCPMKData || mahasiswaCPMKData.length === 0) {
      console.log("No mahasiswa_CPMK data found for the given mahasiswa.");
      return;
    }

    for (const cpl of CPLtoUpdate) {
      const cplId = cpl.id;

      // Filter mahasiswa_CPMK data that relates to this CPL
      const relatedMahasiswaCPMK = mahasiswaCPMKData.filter((entry) =>
        cpl.CPMK.some((cpmk) => cpmk.id === entry.CPMKId)
      );

      console.log(
        "CPL =",
        cplId,
        "relatedMahasiswaCPMK =",
        relatedMahasiswaCPMK
      );

      if (relatedMahasiswaCPMK.length === 0) {
        // If no related mahasiswa_CPMK data, delete the corresponding mahasiswa_CPL entry
        try {
          await prisma.mahasiswa_CPL.delete({
            where: {
              mahasiswaNim_CPLId: {
                mahasiswaNim: nim,
                CPLId: cplId,
              },
            },
          });
        } catch (error) {
          console.error("Error deleting mahasiswa_CPL:", error);
        }
      } else {
        // Calculate the average nilai for this CPL
        const totalNilai = relatedMahasiswaCPMK.reduce(
          (sum, entry) => sum + entry.nilai,
          0
        );
        const averageNilai =
          relatedMahasiswaCPMK.length > 0
            ? totalNilai / relatedMahasiswaCPMK.length
            : 0;

        console.log("averageNilai = ", averageNilai);

        // Upsert operation for mahasiswa_CPL
        try {
          await prisma.performaMahasiswa.upsert({
            where: {
              mahasiswaNim_CPLId: {
                mahasiswaNim: nim,
                CPLId: cplId,
              },
            },
            update: {
              nilai: parseFloat(averageNilai.toFixed(2)),
            },
            create: {
              mahasiswaNim: nim,
              CPLId: cplId,
              nilai: parseFloat(averageNilai.toFixed(2)),
            },
          });
        } catch (error) {
          console.error("Error upserting mahasiswa_CPL:", error);
        }
      }
    }
    console.log("Performa CPL Mahasiswa updated successfully.");
  } catch (error) {
    console.error("Error updating PerformaCPLMahasiswa:", error);
  }
};

export default prismaExtended;
