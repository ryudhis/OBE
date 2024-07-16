/*
  Warnings:

  - Added the required column `deskripsiInggris` to the `CPL` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsiInggris` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CPL" ADD COLUMN     "deskripsiInggris" STRING NOT NULL;

-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "deskripsiInggris" STRING NOT NULL;
