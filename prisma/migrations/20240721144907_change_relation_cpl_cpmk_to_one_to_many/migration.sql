/*
  Warnings:

  - You are about to drop the `_cpmk_cpl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_cpmk_subcpmk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subCPMK` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `CPLKode` to the `CPMK` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_cpmk_cpl" DROP CONSTRAINT "_cpmk_cpl_A_fkey";

-- DropForeignKey
ALTER TABLE "_cpmk_cpl" DROP CONSTRAINT "_cpmk_cpl_B_fkey";

-- DropForeignKey
ALTER TABLE "_cpmk_subcpmk" DROP CONSTRAINT "_cpmk_subcpmk_A_fkey";

-- DropForeignKey
ALTER TABLE "_cpmk_subcpmk" DROP CONSTRAINT "_cpmk_subcpmk_B_fkey";

-- AlterTable
ALTER TABLE "CPMK" ADD COLUMN     "CPLKode" INT4 NOT NULL;

-- DropTable
DROP TABLE "_cpmk_cpl";

-- DropTable
DROP TABLE "_cpmk_subcpmk";

-- DropTable
DROP TABLE "subCPMK";

-- AddForeignKey
ALTER TABLE "CPMK" ADD CONSTRAINT "CPMK_CPLKode_fkey" FOREIGN KEY ("CPLKode") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;
