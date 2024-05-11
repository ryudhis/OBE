/*
  Warnings:

  - Added the required column `batasLulusMK` to the `MK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batasLulusMahasiswa` to the `MK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sks` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "batasLulusMK" FLOAT8 NOT NULL;
ALTER TABLE "MK" ADD COLUMN     "batasLulusMahasiswa" FLOAT8 NOT NULL;
ALTER TABLE "MK" ADD COLUMN     "sks" STRING NOT NULL;