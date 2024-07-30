/*
  Warnings:

  - Changed the type of `jumlahLulus` on the `lulusCPMK` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `jumlahLulus` on the `lulusKelas_CPMK` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `persentaseLulus` to the `lulusMK` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `jumlahLulus` on the `lulusMK_CPMK` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "lulusCPMK" DROP COLUMN "jumlahLulus";
ALTER TABLE "lulusCPMK" ADD COLUMN     "jumlahLulus" FLOAT8 NOT NULL;

-- AlterTable
ALTER TABLE "lulusKelas_CPMK" DROP COLUMN "jumlahLulus";
ALTER TABLE "lulusKelas_CPMK" ADD COLUMN     "jumlahLulus" FLOAT8 NOT NULL;

-- AlterTable
ALTER TABLE "lulusMK" ADD COLUMN     "persentaseLulus" FLOAT8 NOT NULL;

-- AlterTable
ALTER TABLE "lulusMK_CPMK" DROP COLUMN "jumlahLulus";
ALTER TABLE "lulusMK_CPMK" ADD COLUMN     "jumlahLulus" FLOAT8 NOT NULL;
