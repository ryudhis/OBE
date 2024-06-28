/*
  Warnings:

  - Changed the type of `minggu` on the `rencanaPembelajaran` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterSequence
ALTER SEQUENCE "rencanaPembelajaran_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "rencanaPembelajaran" DROP COLUMN "minggu";
ALTER TABLE "rencanaPembelajaran" ADD COLUMN     "minggu" INT4 NOT NULL;
