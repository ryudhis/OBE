/*
  Warnings:

  - A unique constraint covering the columns `[CPMKId,tahunAjaranId]` on the table `lulusCPMK` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kelasId,CPMKId,tahunAjaranId]` on the table `lulusKelas_CPMK` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[MKId,CPMKId,tahunAjaranId]` on the table `lulusMK_CPMK` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterSequence
ALTER SEQUENCE "lulusMK_CPMK_id_seq" MAXVALUE 9223372036854775807;

-- AlterSequence
ALTER SEQUENCE "lulusMK_id_seq" MAXVALUE 9223372036854775807;

-- CreateIndex
CREATE UNIQUE INDEX "lulusCPMK_CPMKId_tahunAjaranId_key" ON "lulusCPMK"("CPMKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusKelas_CPMK_kelasId_CPMKId_tahunAjaranId_key" ON "lulusKelas_CPMK"("kelasId", "CPMKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_CPMK_MKId_CPMKId_tahunAjaranId_key" ON "lulusMK_CPMK"("MKId", "CPMKId", "tahunAjaranId");
