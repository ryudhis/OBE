/*
  Warnings:

  - You are about to drop the column `performaCPL` on the `CPL` table. All the data in the column will be lost.

*/
-- AlterSequence
ALTER SEQUENCE "penilaianCPMK_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "CPL" DROP COLUMN "performaCPL";

-- CreateTable
CREATE TABLE "performaCPL" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "performa" FLOAT8 NOT NULL,
    "CPLId" INT4 NOT NULL,
    "tahunAjaranId" INT4 NOT NULL,

    CONSTRAINT "performaCPL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performaCPL_id_key" ON "performaCPL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "performaCPL_CPLId_tahunAjaranId_key" ON "performaCPL"("CPLId", "tahunAjaranId");

-- AddForeignKey
ALTER TABLE "performaCPL" ADD CONSTRAINT "performaCPL_CPLId_fkey" FOREIGN KEY ("CPLId") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaCPL" ADD CONSTRAINT "performaCPL_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;