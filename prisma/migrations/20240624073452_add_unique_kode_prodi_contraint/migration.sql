/*
  Warnings:

  - A unique constraint covering the columns `[kode,prodiId]` on the table `CPL` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CPL_kode_prodiId_key" ON "CPL"("kode", "prodiId");
