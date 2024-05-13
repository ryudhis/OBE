/*
  Warnings:

  - Added the required column `jumlahLulus` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "jumlahLulus" INT4 NOT NULL;
