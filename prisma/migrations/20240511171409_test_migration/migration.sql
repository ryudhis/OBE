/*
  Warnings:

  - You are about to drop the `inputNilai` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "inputNilai" DROP CONSTRAINT "inputNilai_mahasiswaNim_fkey";

-- DropTable
DROP TABLE "inputNilai";
