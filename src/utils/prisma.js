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
        // Fetch the CPMK record with related MK before deleting
        const CPMKtoDelete = await prisma.CPMK.findUnique({
          where: {
            kode: args.where.kode,
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
          throw new Error(`CPMK with kode ${args.where.kode} not found`);
        }

        // Perform the delete operation
        const deletedCPMK = await query(args);
        console.log("deletedCPMK :", deletedCPMK);

        const CPMKIds = CPMKtoDelete.CPL.CPMK.map((cpmk) => cpmk.id);

        //updatePerformaCPL
        const lulusCPMK = await prisma.lulusCPMK.findMany({
          where: {
            CPMKId: {
              in: CPMKIds,
            },
            tahunAjaranId: tahunAjaranId,
          },
          select: {
            jumlahLulus: true,
            CPMKId: true,
          },
        });

        const cpl = CPMKtoDelete.CPL;
        const cplId = cpl.id;
        const relatedLulusCPMK = lulusCPMK.filter((entry) =>
          cpl.CPMK.some((cpmk) => cpmk.id === entry.CPMKId)
        );

        console.log("CPL = ", cplId, "relatedLulusCPMK = ", relatedLulusCPMK);

        if (relatedLulusCPMK.length === 0) {
          await prisma.performaCPL.delete({
            where: {
              CPLId_tahunAjaranId: {
                CPLId: cplId,
                tahunAjaranId: tahunAjaranId,
              },
            },
          });
        } else {
          const totalJumlahLulus = relatedLulusCPMK.reduce(
            (sum, entry) => sum + entry.jumlahLulus,
            0
          );

          console.log("totalJumlahLulus = ", totalJumlahLulus);

          const numberOfCPMK = cpl.CPMK.length;

          const performa =
            numberOfCPMK > 0 ? totalJumlahLulus / numberOfCPMK : 0;

          console.log("performa = ", performa);

          // Upsert operation
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
        cpmk: pcpmk.CPMK.kode,
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

    console.log("data CPMK :", dataCPMK);

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

        console.log(
          "persentase lulus CPMK = ",
          dataCPMK[indexCPMK].jumlahLulus /
            (selectedKelas.mahasiswa.length / 100)
        );

        nilaiMahasiswa.push(daftarNilai);

        statusCPMK.push({
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK.kode,
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

export default prismaExtended;
