/*
  Warnings:

  - You are about to drop the column `id` on the `penilaianCPMK` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kode]` on the table `penilaianCPMK` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batasNilai` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode` to the `penilaianCPMK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "inputNilai_id_seq" MAXVALUE 9223372036854775807;

-- DropForeignKey
ALTER TABLE "inputNilai" DROP CONSTRAINT "inputNilai_penilaianCPMKId_fkey";

-- DropIndex
DROP INDEX "penilaianCPMK_id_key";

-- AlterTable
ALTER TABLE "inputNilai" ALTER COLUMN "penilaianCPMKId" SET DATA TYPE STRING;

-- AlterTable
ALTER TABLE "penilaianCPMK" DROP COLUMN "id";
ALTER TABLE "penilaianCPMK" ADD COLUMN     "batasNilai" FLOAT8 NOT NULL;
ALTER TABLE "penilaianCPMK" ADD COLUMN     "kode" STRING NOT NULL;
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_pkey" PRIMARY KEY ("kode");

-- CreateIndex
CREATE UNIQUE INDEX "penilaianCPMK_kode_key" ON "penilaianCPMK"("kode");

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_penilaianCPMKId_fkey" FOREIGN KEY ("penilaianCPMKId") REFERENCES "penilaianCPMK"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;
