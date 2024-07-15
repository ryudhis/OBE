/*
  Warnings:

  - A unique constraint covering the columns `[tahun,semester]` on the table `tahunAjaran` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tahunAjaran_tahun_semester_key" ON "tahunAjaran"("tahun", "semester");
