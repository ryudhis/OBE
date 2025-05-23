import prisma from "./prismaClient";

// Utilities
const calculateIndexNilai = (totalNilai) => {
  if (totalNilai <= 40) return "E";
  if (totalNilai <= 50) return "D";
  if (totalNilai <= 60) return "C";
  if (totalNilai <= 65) return "BC";
  if (totalNilai <= 70) return "B";
  if (totalNilai <= 80) return "AB";
  return "A";
};

const upsertRecord = async (model, where, data) => {
  return prisma[model].upsert({ where, create: data, update: data });
};

const average = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

const updateKelas = async (data) => {
  try {
    const MK = await prisma.MK.findUnique({
      where: { kode: data.MKId },
      include: {
        kelas: { include: { mahasiswa: true } },
        CPMK: { include: { MK: true, CPL: { include: { CPMK: true } } } },
        penilaianCPMK: true,
      },
    });
    if (!MK) throw new Error("MK not found");

    const selectedKelas = await prisma.kelas.findUnique({
      where: { id: data.kelasId },
      include: {
        templatePenilaianCPMK: {
          include: { penilaianCPMK: { include: { CPMK: true, CPL: true } } },
        },
        mahasiswa: true,
        tahunAjaran: true,
      },
    });
    if (!selectedKelas) throw new Error("Selected class not found");

    const mahasiswaLulus = [];
    const dataCPMK = selectedKelas.templatePenilaianCPMK.penilaianCPMK.map(
      (pcpmk) => ({
        cpmkId: pcpmk.CPMK.id,
        cpmk: pcpmk.CPMK.kode,
        cplId: pcpmk.CPL.id,
        cpl: pcpmk.CPL.kode,
        nilaiMinimal: pcpmk.batasNilai,
        nilaiMasuk: 0,
        jumlahLulus: 0,
        persenLulus: 0,
        rataNilai: 0,
      })
    );

    const rataCPMK = dataCPMK.map(() => ({ nilai: 0 }));
    let totalLulusKelas = 0;

    for (const mahasiswa of selectedKelas.mahasiswa) {
      const nilaiRecords = await prisma.inputNilai.findMany({
        where: {
          penilaianCPMK: {
            templatePenilaianCPMKId: selectedKelas.templatePenilaianCPMKId,
          },
          mahasiswaNim: mahasiswa.nim,
        },
        include: { penilaianCPMK: { include: { CPMK: true, CPL: true } } },
      });

      let totalNilai = 0;
      const statusCPMK = [];
      const nilaiMahasiswa = [];

      const nilaiKriteriaMap = {}; // { kriteriaName: { totalNilai: x, totalBobot: y } }

      for (const nilaiCPMK of nilaiRecords) {
        const idx = dataCPMK.findIndex(
          (d) => d.cpmk === nilaiCPMK.penilaianCPMK.CPMK.kode
        );
        const kriteria = nilaiCPMK.penilaianCPMK.kriteria || [];
        const nilaiArr = nilaiCPMK.nilai || [];

        let totalNilaiCPMK = 0;
        let totalNilaiTidakBobot = 0;
        let totalBobot = 0;
        let rataNilai = 0;

        nilaiArr.forEach((val, i) => {
          if (kriteria[i]) {
            const bobot = kriteria[i].bobot / 100;
            const namaKriteria = kriteria[i].kriteria;

            totalNilaiCPMK += val * bobot;
            totalNilaiTidakBobot += val;
            totalBobot += kriteria[i].bobot;
            totalNilai += val * bobot;
            rataNilai += val;

            // Aggregate nilai per kriteria
            if (!nilaiKriteriaMap[namaKriteria]) {
              nilaiKriteriaMap[namaKriteria] = { totalNilai: 0, totalBobot: 0 };
            }

            nilaiKriteriaMap[namaKriteria].totalNilai += val * bobot;
            nilaiKriteriaMap[namaKriteria].totalBobot += bobot;
          }
        });

        totalNilaiTidakBobot /= nilaiArr.length;

        rataCPMK[idx].nilai += rataNilai / nilaiArr.length;
        dataCPMK[idx].nilaiMasuk += 1;

        await upsertRecord(
          "mahasiswa_MK_CPMK",
          {
            mahasiswaNim_MKId_CPMKId: {
              mahasiswaNim: mahasiswa.nim,
              MKId: selectedKelas.MKId,
              CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            },
          },
          {
            mahasiswaNim: mahasiswa.nim,
            MKId: selectedKelas.MKId,
            CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            nilai: parseFloat((rataNilai / nilaiArr.length).toFixed(2)),
          }
        );

        if (
          totalNilaiCPMK >=
          nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
        ) {
          dataCPMK[idx].jumlahLulus += 1;
        }

        await upsertRecord(
          "lulusKelas_CPMK",
          {
            kelasId_CPMKId_tahunAjaranId: {
              kelasId: selectedKelas.id,
              tahunAjaranId: selectedKelas.tahunAjaranId,
              CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            },
          },
          {
            kelasId: selectedKelas.id,
            tahunAjaranId: selectedKelas.tahunAjaranId,
            CPMKId: nilaiCPMK.penilaianCPMK.CPMK.id,
            jumlahLulus:
              dataCPMK[idx].jumlahLulus /
              (selectedKelas.mahasiswa.length / 100),
          }
        );

        nilaiMahasiswa.push({
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK.kode,
          totalNilai: totalNilaiTidakBobot.toFixed(2),
          batasNilai: nilaiCPMK.penilaianCPMK.batasNilai,
          nilai: nilaiArr,
        });

        statusCPMK.push({
          nilaiId: nilaiCPMK.id,
          namaCPMK: nilaiCPMK.penilaianCPMK.CPMK.kode,
          nilaiCPMK: totalNilaiCPMK.toFixed(2),
          kriteria: kriteria.map((k) => k.kriteria),
          statusLulus:
            totalNilaiCPMK >=
            nilaiCPMK.penilaianCPMK.batasNilai * (totalBobot / 100)
              ? "Lulus"
              : "Tidak Lulus",
        });
      }

      const statusLulus =
        totalNilai >= MK.batasLulusMahasiswa ? "Lulus" : "Tidak Lulus";
      const indexNilai = calculateIndexNilai(totalNilai);

      const nilaiKriteria = Object.entries(nilaiKriteriaMap).map(
        ([kriteria, data]) => ({
          kriteria,
          nilai: parseFloat((data.totalNilai / data.totalBobot).toFixed(2)),
        })
      );

      mahasiswaLulus.push({
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        totalNilai: totalNilai.toFixed(2),
        indexNilai,
        nilaiMahasiswa,
        statusLulus,
        statusCPMK,
        nilaiKriteria,
      });

      await upsertRecord(
        "mahasiswa_MK",
        {
          mahasiswaNim_MKId: {
            mahasiswaNim: mahasiswa.nim,
            MKId: selectedKelas.MKId,
          },
        },
        {
          mahasiswaNim: mahasiswa.nim,
          MKId: selectedKelas.MKId,
          nilai: parseFloat(totalNilai.toFixed(2)),
        }
      );

      if (totalNilai >= MK.batasLulusMahasiswa) totalLulusKelas += 1;

      // Update performa CPMK Mahasiswa
      updatePerformaCPMKMahasiswa(mahasiswa.nim, selectedKelas, MK);
    }

    dataCPMK.forEach((item, i) => {
      item.persenLulus = (
        item.jumlahLulus /
        (selectedKelas.mahasiswa.length / 100)
      ).toFixed(2);
      item.rataNilai = (rataCPMK[i].nilai / item.nilaiMasuk).toFixed(2);
    });

    const mahasiswaPerbaikan = mahasiswaLulus
      .filter((m) => m.statusLulus === "Tidak Lulus")
      .map((m) => ({
        ...m,
        statusCPMK: m.statusCPMK.filter((c) => c.statusLulus === "Tidak Lulus"),
      }));

    const cplMap = {};
    dataCPMK.forEach(({ cpl, cplId, persenLulus, rataNilai }) => {
      if (!cplMap[cpl])
        cplMap[cpl] = {
          cpl,
          cplId,
          persenLulusTotal: 0,
          rataNilaiTotal: 0,
          count: 0,
        };
      cplMap[cpl].persenLulusTotal += Number(persenLulus);
      cplMap[cpl].rataNilaiTotal += Number(rataNilai);
      cplMap[cpl].count += 1;
    });

    const dataCPL = Object.values(cplMap).map(
      ({ cpl, cplId, persenLulusTotal, rataNilaiTotal, count }) => ({
        cpl,
        cplId,
        persenLulus: (persenLulusTotal / count).toFixed(2),
        rataNilai: (rataNilaiTotal / count).toFixed(2),
      })
    );

    await prisma.kelas.update({
      where: { id: selectedKelas.id },
      data: {
        jumlahLulus: totalLulusKelas,
        mahasiswaLulus,
        mahasiswaPerbaikan,
        dataCPMK,
        dataCPL,
      },
    });

    await updateMK(MK.kode, selectedKelas.tahunAjaranId);
  } catch (error) {
    console.error("Error updating Kelas:", error);
  }
};

const updateMK = async (MKId, tahunAjaranId) => {
  try {
    const MK = await prisma.MK.findUnique({
      where: { kode: MKId },
      include: {
        kelas: true,
        CPMK: { include: { CPL: { include: { CPMK: true } } } },
      },
    });
    if (!MK) throw new Error("MK not found");

    const kelasTahunAjaran = MK.kelas.filter(
      (k) => k.tahunAjaranId === tahunAjaranId
    );
    const totalLulusMK = kelasTahunAjaran.reduce(
      (sum, k) => sum + (k.jumlahLulus || 0),
      0
    );

    const totalMahasiswa = await prisma.mahasiswa.count({
      where: {
        kelas: {
          some: {
            MKId,
            tahunAjaranId,
          },
        },
      },
    });

    await upsertRecord(
      "lulusMK",
      {
        MKId_tahunAjaranId: { MKId, tahunAjaranId },
      },
      {
        MKId,
        tahunAjaranId,
        jumlahLulus: totalLulusMK,
        persentaseLulus:
          totalMahasiswa > 0 ? (totalLulusMK / totalMahasiswa) * 100 : 0,
      }
    );

    const kelasIds = kelasTahunAjaran.map((k) => k.id);
    const lulusKelasCPMK = await prisma.lulusKelas_CPMK.findMany({
      where: { kelasId: { in: kelasIds } },
      select: { jumlahLulus: true, CPMKId: true },
    });

    const groupedLulus = lulusKelasCPMK.reduce(
      (acc, { jumlahLulus, CPMKId }) => {
        if (!acc[CPMKId]) acc[CPMKId] = [];
        acc[CPMKId].push(jumlahLulus);
        return acc;
      },
      {}
    );

    const allCPMKIds = MK.CPMK.map((c) => c.id);
    const presentCPMKIds = Object.keys(groupedLulus).map((id) => parseInt(id));
    const cpmkIdsToDelete = allCPMKIds.filter(
      (id) => !presentCPMKIds.includes(id)
    );

    if (cpmkIdsToDelete.length > 0) {
      await prisma.lulusMK_CPMK.deleteMany({
        where: {
          MKId,
          tahunAjaranId,
          CPMKId: { in: cpmkIdsToDelete },
        },
      });
    }

    await Promise.all(
      Object.entries(groupedLulus).map(([CPMKId, values]) =>
        upsertRecord(
          "lulusMK_CPMK",
          {
            MKId_CPMKId_tahunAjaranId: {
              MKId,
              CPMKId: parseInt(CPMKId),
              tahunAjaranId,
            },
          },
          {
            MKId,
            CPMKId: parseInt(CPMKId),
            tahunAjaranId,
            jumlahLulus: average(values),
          }
        )
      )
    );

    await updateCPMK(MK, tahunAjaranId);
  } catch (error) {
    console.error("Error updating MK:", error);
  }
};

const updateCPMK = async (MK, tahunAjaranId) => {
  try {
    const CPMKIds = MK.CPMK.map((cpmk) => cpmk.id);

    const lulusMKCPMK = await prisma.lulusMK_CPMK.findMany({
      where: {
        CPMKId: { in: CPMKIds },
        tahunAjaranId,
      },
      select: { jumlahLulus: true, CPMKId: true },
    });

    const grouped = lulusMKCPMK.reduce((acc, { jumlahLulus, CPMKId }) => {
      if (!acc[CPMKId]) acc[CPMKId] = [];
      acc[CPMKId].push(jumlahLulus);
      return acc;
    }, {});

    const presentIds = Object.keys(grouped).map((id) => parseInt(id));
    const missingIds = CPMKIds.filter((id) => !presentIds.includes(id));

    if (missingIds.length > 0) {
      await prisma.lulusCPMK.deleteMany({
        where: { tahunAjaranId, CPMKId: { in: missingIds } },
      });
    }

    await Promise.all(
      Object.entries(grouped).map(([CPMKId, values]) =>
        upsertRecord(
          "lulusCPMK",
          {
            CPMKId_tahunAjaranId: {
              CPMKId: parseInt(CPMKId),
              tahunAjaranId,
            },
          },
          {
            CPMKId: parseInt(CPMKId),
            tahunAjaranId,
            jumlahLulus: average(values),
          }
        )
      )
    );

    await updatePerformaCPL(MK, tahunAjaranId);
  } catch (error) {
    console.error("Error updating CPMK:", error);
  }
};

const updatePerformaCPL = async (MK, tahunAjaranId) => {
  try {
    const CPLList = [...new Set(MK.CPMK.map((cpmk) => cpmk.CPL))];
    const CPLtoUpdate = CPLList.filter(
      (cpl, index, self) => index === self.findIndex((t) => t.id === cpl.id)
    );
    const CPMKIds = CPLtoUpdate.flatMap((cpl) =>
      cpl.CPMK.map((cpmk) => cpmk.id)
    );

    const lulusCPMK = await prisma.lulusCPMK.findMany({
      where: {
        CPMKId: { in: CPMKIds },
        tahunAjaranId,
      },
      select: { jumlahLulus: true, CPMKId: true },
    });

    for (const cpl of CPLtoUpdate) {
      const relatedLulus = lulusCPMK.filter((e) =>
        cpl.CPMK.some((cpmk) => cpmk.id === e.CPMKId)
      );

      if (relatedLulus.length === 0) {
        await prisma.performaCPL
          .delete({
            where: {
              CPLId_tahunAjaranId: {
                CPLId: cpl.id,
                tahunAjaranId,
              },
            },
          })
          .catch(() => {});
        continue;
      }

      const performa = average(relatedLulus.map((e) => e.jumlahLulus));
      await upsertRecord(
        "performaCPL",
        {
          CPLId_tahunAjaranId: {
            CPLId: cpl.id,
            tahunAjaranId,
          },
        },
        {
          CPLId: cpl.id,
          tahunAjaranId,
          performa,
        }
      );
    }
  } catch (error) {
    console.error("Error updating Performa CPL:", error);
  }
};

const updatePerformaCPMKMahasiswa = async (nim, kelas, MK) => {
  const { penilaianCPMK } = kelas.templatePenilaianCPMK;

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

export {
  updateKelas,
  updateMK,
  updateCPMK,
  updatePerformaCPL,
  updatePerformaCPMKMahasiswa,
  updatePerformaCPLMahasiswa,
};
