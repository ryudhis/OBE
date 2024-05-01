/*
  Warnings:

  - A unique constraint covering the columns `[penilaianCPMKId,mahasiswaNim]` on the table `inputNilai` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "inputNilai_penilaianCPMKId_mahasiswaNim_key" ON "inputNilai"("penilaianCPMKId", "mahasiswaNim");

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_penilaianCPMKId_fkey" FOREIGN KEY ("penilaianCPMKId") REFERENCES "penilaianCPMK"("kode") ON DELETE RESTRICT ON UPDATE CASCADE;
