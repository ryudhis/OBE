-- DropForeignKey
ALTER TABLE "inputNilai" DROP CONSTRAINT "inputNilai_mahasiswaNim_fkey";

-- DropForeignKey
ALTER TABLE "inputNilai" DROP CONSTRAINT "inputNilai_penilaianCPMKId_fkey";

-- DropForeignKey
ALTER TABLE "kelas" DROP CONSTRAINT "kelas_MKId_fkey";

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_penilaianCPMKId_fkey" FOREIGN KEY ("penilaianCPMKId") REFERENCES "penilaianCPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;
