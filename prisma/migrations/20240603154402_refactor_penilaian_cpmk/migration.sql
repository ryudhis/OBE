/*
  Warnings:

  - You are about to drop the column `CPL` on the `penilaianCPMK` table. All the data in the column will be lost.
  - You are about to drop the column `CPMK` on the `penilaianCPMK` table. All the data in the column will be lost.
  - You are about to drop the column `MK` on the `penilaianCPMK` table. All the data in the column will be lost.
  - Added the required column `CPLkode` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CPMKkode` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MKkode` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "penilaianCPMK" DROP COLUMN "CPL";
ALTER TABLE "penilaianCPMK" DROP COLUMN "CPMK";
ALTER TABLE "penilaianCPMK" DROP COLUMN "MK";
ALTER TABLE "penilaianCPMK" ADD COLUMN     "CPLkode" STRING NOT NULL;
ALTER TABLE "penilaianCPMK" ADD COLUMN     "CPMKkode" STRING NOT NULL;
ALTER TABLE "penilaianCPMK" ADD COLUMN     "MKkode" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_CPLkode_fkey" FOREIGN KEY ("CPLkode") REFERENCES "CPL"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_MKkode_fkey" FOREIGN KEY ("MKkode") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_CPMKkode_fkey" FOREIGN KEY ("CPMKkode") REFERENCES "CPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
