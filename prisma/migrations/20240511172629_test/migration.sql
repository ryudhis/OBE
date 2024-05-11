/*
  Warnings:

  - Added the required column `testing` to the `MK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "inputNilai_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "MK" ADD COLUMN     "testing" STRING NOT NULL;
