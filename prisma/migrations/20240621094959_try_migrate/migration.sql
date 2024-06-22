/*
  Warnings:

  - Added the required column `wawan` to the `prodi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prodi" ADD COLUMN     "wawan" STRING NOT NULL;
