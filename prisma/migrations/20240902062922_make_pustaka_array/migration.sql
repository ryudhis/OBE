/*
  Warnings:

  - The `pustakaUtama` column on the `rps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pustakaPendukung` column on the `rps` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "rps" DROP COLUMN "pustakaUtama";
ALTER TABLE "rps" ADD COLUMN     "pustakaUtama" STRING[];
ALTER TABLE "rps" DROP COLUMN "pustakaPendukung";
ALTER TABLE "rps" ADD COLUMN     "pustakaPendukung" STRING[];
