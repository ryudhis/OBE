/*
  Warnings:

  - Added the required column `active` to the `templatePenilaianCPMK` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "penilaianCPMK" DROP CONSTRAINT "penilaianCPMK_templatePenilaianCPMKId_fkey";

-- AlterTable
ALTER TABLE "templatePenilaianCPMK" ADD COLUMN     "active" BOOL NOT NULL;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;
