/*
  Warnings:

  - Added the required column `templatePenilaianCPMKId` to the `kelas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kelas" ADD COLUMN     "templatePenilaianCPMKId" INT4 NOT NULL;

-- CreateIndex
CREATE INDEX "kelas_templatePenilaianCPMKId_idx" ON "kelas"("templatePenilaianCPMKId");

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
