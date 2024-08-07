/*
  Warnings:

  - A unique constraint covering the columns `[nama,MKId,tahunAjaranId]` on the table `kelas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periode` to the `MK` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahunAjaranId` to the `kelas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "PL_id_seq" MAXVALUE 9223372036854775807;

-- AlterSequence
ALTER SEQUENCE "rencanaPembelajaran_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "periode" STRING NOT NULL;

-- AlterTable
ALTER TABLE "kelas" ADD COLUMN     "tahunAjaranId" INT4 NOT NULL;

-- CreateTable
CREATE TABLE "tahunAjaran" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "tahun" STRING NOT NULL,
    "semester" STRING NOT NULL,

    CONSTRAINT "tahunAjaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tahunAjaran_id_key" ON "tahunAjaran"("id");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_nama_MKId_tahunAjaranId_key" ON "kelas"("nama", "MKId", "tahunAjaranId");

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
