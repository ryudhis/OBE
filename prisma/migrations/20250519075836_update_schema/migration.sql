/*
  Warnings:

  - A unique constraint covering the columns `[minggu,templatePenilaianCPMKId]` on the table `rencanaPembelajaran` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `materiPembelajaran` to the `rps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rps" ADD COLUMN     "materiPembelajaran" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rencanaPembelajaran_minggu_templatePenilaianCPMKId_key" ON "rencanaPembelajaran"("minggu", "templatePenilaianCPMKId");
