/*
  Warnings:

  - A unique constraint covering the columns `[kode,prodiId]` on the table `BK` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode,prodiId]` on the table `CPMK` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode,prodiId]` on the table `PL` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BK_kode_prodiId_key" ON "BK"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "CPMK_kode_prodiId_key" ON "CPMK"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "PL_kode_prodiId_key" ON "PL"("kode", "prodiId");
