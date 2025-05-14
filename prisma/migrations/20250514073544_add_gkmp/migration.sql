/*
  Warnings:

  - You are about to drop the column `MKId` on the `rencanaPembelajaran` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[GKMPId]` on the table `prodi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `templatePenilaianCPMKId` to the `rencanaPembelajaran` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rencanaPembelajaran" DROP CONSTRAINT "rencanaPembelajaran_MKId_fkey";

-- DropIndex
DROP INDEX "rencanaPembelajaran_MKId_idx";

-- AlterTable
ALTER TABLE "prodi" ADD COLUMN     "GKMPId" INT4;

-- AlterTable
ALTER TABLE "rencanaPembelajaran" DROP COLUMN "MKId";
ALTER TABLE "rencanaPembelajaran" ADD COLUMN     "templatePenilaianCPMKId" INT4 NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prodi_GKMPId_key" ON "prodi"("GKMPId");

-- CreateIndex
CREATE INDEX "rencanaPembelajaran_templatePenilaianCPMKId_idx" ON "rencanaPembelajaran"("templatePenilaianCPMKId");

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_GKMPId_fkey" FOREIGN KEY ("GKMPId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rencanaPembelajaran" ADD CONSTRAINT "rencanaPembelajaran_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;
