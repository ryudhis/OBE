-- AlterSequence
ALTER SEQUENCE "account_id_seq" MAXVALUE 9223372036854775807;

-- AlterSequence
ALTER SEQUENCE "performaCPL_id_seq" MAXVALUE 9223372036854775807;

-- CreateTable
CREATE TABLE "mahasiswa_MK_CPMK" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "mahasiswaNim" STRING NOT NULL,
    "MKId" STRING NOT NULL,
    "CPMKId" INT4 NOT NULL,
    "nilai" FLOAT8 NOT NULL,

    CONSTRAINT "mahasiswa_MK_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_CPMK" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "mahasiswaNim" STRING NOT NULL,
    "CPMKId" INT4 NOT NULL,
    "nilai" FLOAT8 NOT NULL,

    CONSTRAINT "mahasiswa_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performaMahasiswa" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "mahasiswaNim" STRING NOT NULL,
    "CPLId" INT4 NOT NULL,
    "nilai" FLOAT8 NOT NULL,

    CONSTRAINT "performaMahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_CPMK_id_key" ON "mahasiswa_MK_CPMK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_mahasiswaNim_idx" ON "mahasiswa_MK_CPMK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_MKId_idx" ON "mahasiswa_MK_CPMK"("MKId");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_CPMKId_idx" ON "mahasiswa_MK_CPMK"("CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_CPMK_mahasiswaNim_MKId_CPMKId_key" ON "mahasiswa_MK_CPMK"("mahasiswaNim", "MKId", "CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_CPMK_id_key" ON "mahasiswa_CPMK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_CPMK_mahasiswaNim_idx" ON "mahasiswa_CPMK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_CPMK_CPMKId_idx" ON "mahasiswa_CPMK"("CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_CPMK_mahasiswaNim_CPMKId_key" ON "mahasiswa_CPMK"("mahasiswaNim", "CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "performaMahasiswa_id_key" ON "performaMahasiswa"("id");

-- CreateIndex
CREATE INDEX "performaMahasiswa_mahasiswaNim_idx" ON "performaMahasiswa"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "performaMahasiswa_CPLId_idx" ON "performaMahasiswa"("CPLId");

-- CreateIndex
CREATE UNIQUE INDEX "performaMahasiswa_mahasiswaNim_CPLId_key" ON "performaMahasiswa"("mahasiswaNim", "CPLId");

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_CPMK" ADD CONSTRAINT "mahasiswa_CPMK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_CPMK" ADD CONSTRAINT "mahasiswa_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaMahasiswa" ADD CONSTRAINT "performaMahasiswa_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaMahasiswa" ADD CONSTRAINT "performaMahasiswa_CPLId_fkey" FOREIGN KEY ("CPLId") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;
