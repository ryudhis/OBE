import prisma from "@/utils/prismaClient";
import { updateKelas, updateMK, updateCPMK } from "@/utils/prismaUpdateFunc";

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

export default prismaExtended;
