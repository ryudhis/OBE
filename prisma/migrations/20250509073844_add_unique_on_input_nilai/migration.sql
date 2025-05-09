/*
  Warnings:

  - You are about to drop the column `kunci` on the `kunci` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[penilaianCPMKId,mahasiswaNim,kelasId]` on the table `inputNilai` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `kunci` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nilai` to the `kunci` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kunci" DROP COLUMN "kunci";
ALTER TABLE "kunci" ADD COLUMN     "data" BOOL NOT NULL;
ALTER TABLE "kunci" ADD COLUMN     "nilai" BOOL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "inputNilai_penilaianCPMKId_mahasiswaNim_kelasId_key" ON "inputNilai"("penilaianCPMKId", "mahasiswaNim", "kelasId");
