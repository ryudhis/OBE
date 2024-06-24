/*
  Warnings:

  - Added the required column `prodiId` to the `inputNilai` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodiId` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inputNilai" ADD COLUMN     "prodiId" STRING NOT NULL;

-- AlterTable
ALTER TABLE "penilaianCPMK" ADD COLUMN     "prodiId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
