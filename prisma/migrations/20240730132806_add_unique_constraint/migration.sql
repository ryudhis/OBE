/*
  Warnings:

  - A unique constraint covering the columns `[MKId,tahunAjaranId]` on the table `lulusMK` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_MKId_tahunAjaranId_key" ON "lulusMK"("MKId", "tahunAjaranId");
