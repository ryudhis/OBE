/*
  Warnings:

  - Added the required column `kelasId` to the `inputNilai` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inputNilai" ADD COLUMN     "kelasId" INT4 NOT NULL;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
