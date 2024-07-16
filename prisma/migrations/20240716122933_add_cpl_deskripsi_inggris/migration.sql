/*
  Warnings:

  - Added the required column `deskripsiInggris` to the `CPL` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "CPL_id_seq" MAXVALUE 9223372036854775807;

-- AlterSequence
ALTER SEQUENCE "rencanaPembelajaran_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "CPL" ADD COLUMN     "deskripsiInggris" STRING NOT NULL;
