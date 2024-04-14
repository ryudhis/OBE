-- CreateTable
CREATE TABLE "penilaianCPMK" (
    "kode" STRING NOT NULL,
    "CPL" STRING NOT NULL,
    "MK" STRING NOT NULL,
    "CPMK" STRING NOT NULL,
    "tahapPenilaian" STRING NOT NULL,
    "teknikPenilaian" STRING NOT NULL,
    "instrumen" STRING NOT NULL,
    "kriteria" JSONB NOT NULL,

    CONSTRAINT "penilaianCPMK_pkey" PRIMARY KEY ("kode")
);

-- CreateIndex
CREATE UNIQUE INDEX "penilaianCPMK_kode_key" ON "penilaianCPMK"("kode");
