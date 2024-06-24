/*
  Warnings:

  - Added the required column `prodiId` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mahasiswa" ADD COLUMN     "prodiId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
