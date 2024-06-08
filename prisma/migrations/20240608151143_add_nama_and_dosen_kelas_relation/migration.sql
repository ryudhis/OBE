/*
  Warnings:

  - Added the required column `nama` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "account_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "nama" STRING NOT NULL;
ALTER TABLE "account" ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_kelas_dosen" (
    "A" INT4 NOT NULL,
    "B" INT4 NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_kelas_dosen_AB_unique" ON "_kelas_dosen"("A", "B");

-- CreateIndex
CREATE INDEX "_kelas_dosen_B_index" ON "_kelas_dosen"("B");

-- AddForeignKey
ALTER TABLE "_kelas_dosen" ADD CONSTRAINT "_kelas_dosen_A_fkey" FOREIGN KEY ("A") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kelas_dosen" ADD CONSTRAINT "_kelas_dosen_B_fkey" FOREIGN KEY ("B") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
