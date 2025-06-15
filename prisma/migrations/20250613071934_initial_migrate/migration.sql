-- CreateTable
CREATE TABLE "kunci" (
    "id" SERIAL NOT NULL,
    "data" BOOLEAN NOT NULL,
    "nilai" BOOLEAN NOT NULL,

    CONSTRAINT "kunci_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahunAjaran" (
    "id" SERIAL NOT NULL,
    "tahun" TEXT NOT NULL,
    "semester" TEXT NOT NULL,

    CONSTRAINT "tahunAjaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prodi" (
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kaprodiId" INTEGER,
    "GKMPId" INTEGER,

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "kelompokKeahlian" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "ketuaId" INTEGER,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "kelompokKeahlian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "signature" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PL" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "prodiId" TEXT,

    CONSTRAINT "PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPL" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "deskripsiInggris" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "CPL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performaCPL" (
    "id" SERIAL NOT NULL,
    "performa" DOUBLE PRECISION NOT NULL,
    "CPLId" INTEGER NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,

    CONSTRAINT "performaCPL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BK" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "BK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MK" (
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "deskripsiInggris" TEXT NOT NULL,
    "sks" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "batasLulusMahasiswa" DOUBLE PRECISION NOT NULL,
    "batasLulusMK" DOUBLE PRECISION NOT NULL,
    "KKId" INTEGER NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "MK_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "templatePenilaianCPMK" (
    "id" SERIAL NOT NULL,
    "template" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "MKId" TEXT NOT NULL,

    CONSTRAINT "templatePenilaianCPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rps" (
    "id" SERIAL NOT NULL,
    "MKId" TEXT NOT NULL,
    "pengembangId" INTEGER,
    "deskripsi" TEXT NOT NULL,
    "materiPembelajaran" TEXT NOT NULL,
    "pustakaUtama" TEXT[],
    "pustakaPendukung" TEXT[],
    "software" TEXT NOT NULL,
    "hardware" TEXT NOT NULL,
    "revisi" TEXT NOT NULL,
    "signaturePengembang" TEXT,
    "signatureKaprodi" TEXT,
    "signatureKetuaKK" TEXT,
    "signatureGKMP" TEXT,

    CONSTRAINT "rps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lulusMK_CPMK" (
    "id" SERIAL NOT NULL,
    "MKId" TEXT NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "jumlahLulus" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "lulusMK_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lulusMK" (
    "id" SERIAL NOT NULL,
    "MKId" TEXT NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,
    "jumlahLulus" INTEGER NOT NULL,
    "persentaseLulus" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "lulusMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rencanaPembelajaran" (
    "id" SERIAL NOT NULL,
    "minggu" INTEGER NOT NULL,
    "bahanKajian" TEXT NOT NULL,
    "bentuk" TEXT NOT NULL,
    "metode" TEXT NOT NULL,
    "sumber" TEXT NOT NULL,
    "waktu" TEXT NOT NULL,
    "pengalaman" TEXT NOT NULL,
    "templatePenilaianCPMKId" INTEGER NOT NULL,
    "penilaianCPMKId" INTEGER NOT NULL,

    CONSTRAINT "rencanaPembelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaianRP" (
    "id" SERIAL NOT NULL,
    "kriteria" TEXT NOT NULL,
    "indikator" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "rencanaPembelajaranId" INTEGER NOT NULL,

    CONSTRAINT "penilaianRP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlahLulus" INTEGER NOT NULL,
    "mahasiswaLulus" JSONB,
    "mahasiswaPerbaikan" JSONB,
    "dataCPMK" JSONB,
    "dataCPL" JSONB,
    "tindakLanjutCPMK" TEXT,
    "tindakLanjutCPL" TEXT,
    "MKId" TEXT NOT NULL,
    "templatePenilaianCPMKId" INTEGER NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluasiCPMKKelas" (
    "id" SERIAL NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "evaluasi" TEXT NOT NULL,

    CONSTRAINT "evaluasiCPMKKelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluasiCPLKelas" (
    "id" SERIAL NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "CPLId" INTEGER NOT NULL,
    "evaluasi" TEXT NOT NULL,

    CONSTRAINT "evaluasiCPLKelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lulusKelas_CPMK" (
    "id" SERIAL NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,
    "jumlahLulus" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "lulusKelas_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPMK" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "CPLKode" INTEGER NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lulusCPMK" (
    "id" SERIAL NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "tahunAjaranId" INTEGER NOT NULL,
    "jumlahLulus" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "lulusCPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaianCPMK" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "CPLkode" INTEGER NOT NULL,
    "MKkode" TEXT NOT NULL,
    "CPMKkode" INTEGER NOT NULL,
    "tahapPenilaian" TEXT NOT NULL,
    "teknikPenilaian" TEXT NOT NULL,
    "instrumen" TEXT NOT NULL,
    "batasNilai" DOUBLE PRECISION NOT NULL,
    "kriteria" JSONB NOT NULL,
    "prodiId" TEXT NOT NULL,
    "templatePenilaianCPMKId" INTEGER NOT NULL,

    CONSTRAINT "penilaianCPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("nim")
);

-- CreateTable
CREATE TABLE "mahasiswa_MK" (
    "id" SERIAL NOT NULL,
    "mahasiswaNim" TEXT NOT NULL,
    "MKId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mahasiswa_MK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_MK_CPMK" (
    "id" SERIAL NOT NULL,
    "mahasiswaNim" TEXT NOT NULL,
    "MKId" TEXT NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mahasiswa_MK_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa_CPMK" (
    "id" SERIAL NOT NULL,
    "mahasiswaNim" TEXT NOT NULL,
    "CPMKId" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mahasiswa_CPMK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performaMahasiswa" (
    "id" SERIAL NOT NULL,
    "mahasiswaNim" TEXT NOT NULL,
    "CPLId" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "performaMahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inputNilai" (
    "id" SERIAL NOT NULL,
    "penilaianCPMKId" INTEGER NOT NULL,
    "mahasiswaNim" TEXT NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION[],
    "prodiId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_kelas_dosen" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_kelas_dosen_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cpl_pl" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_cpl_pl_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cpl_bk" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_cpl_bk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_bk_mk" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_bk_mk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Prerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Prerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_kelas_mahasiswa" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_kelas_mahasiswa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cpmk_mk" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cpmk_mk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "kunci_id_key" ON "kunci"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tahunAjaran_id_key" ON "tahunAjaran"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tahunAjaran_tahun_semester_key" ON "tahunAjaran"("tahun", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_kode_key" ON "prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_kaprodiId_key" ON "prodi"("kaprodiId");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_GKMPId_key" ON "prodi"("GKMPId");

-- CreateIndex
CREATE UNIQUE INDEX "kelompokKeahlian_id_key" ON "kelompokKeahlian"("id");

-- CreateIndex
CREATE UNIQUE INDEX "kelompokKeahlian_ketuaId_key" ON "kelompokKeahlian"("ketuaId");

-- CreateIndex
CREATE INDEX "kelompokKeahlian_prodiId_idx" ON "kelompokKeahlian"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "account_id_key" ON "account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE INDEX "account_prodiId_idx" ON "account"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "PL_id_key" ON "PL"("id");

-- CreateIndex
CREATE INDEX "PL_prodiId_idx" ON "PL"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "PL_kode_prodiId_key" ON "PL"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "CPL_id_key" ON "CPL"("id");

-- CreateIndex
CREATE INDEX "CPL_prodiId_idx" ON "CPL"("prodiId");

-- CreateIndex
CREATE INDEX "CPL_kode_idx" ON "CPL"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "CPL_kode_prodiId_key" ON "CPL"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "performaCPL_id_key" ON "performaCPL"("id");

-- CreateIndex
CREATE INDEX "performaCPL_CPLId_idx" ON "performaCPL"("CPLId");

-- CreateIndex
CREATE INDEX "performaCPL_tahunAjaranId_idx" ON "performaCPL"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "performaCPL_CPLId_tahunAjaranId_key" ON "performaCPL"("CPLId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "BK_id_key" ON "BK"("id");

-- CreateIndex
CREATE INDEX "BK_prodiId_idx" ON "BK"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "BK_kode_prodiId_key" ON "BK"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "MK_kode_key" ON "MK"("kode");

-- CreateIndex
CREATE INDEX "MK_KKId_idx" ON "MK"("KKId");

-- CreateIndex
CREATE INDEX "MK_prodiId_idx" ON "MK"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "templatePenilaianCPMK_id_key" ON "templatePenilaianCPMK"("id");

-- CreateIndex
CREATE INDEX "templatePenilaianCPMK_MKId_idx" ON "templatePenilaianCPMK"("MKId");

-- CreateIndex
CREATE UNIQUE INDEX "rps_id_key" ON "rps"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rps_MKId_key" ON "rps"("MKId");

-- CreateIndex
CREATE INDEX "rps_MKId_idx" ON "rps"("MKId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_CPMK_id_key" ON "lulusMK_CPMK"("id");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_MKId_idx" ON "lulusMK_CPMK"("MKId");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_CPMKId_idx" ON "lulusMK_CPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_tahunAjaranId_idx" ON "lulusMK_CPMK"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_CPMK_MKId_CPMKId_tahunAjaranId_key" ON "lulusMK_CPMK"("MKId", "CPMKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_id_key" ON "lulusMK"("id");

-- CreateIndex
CREATE INDEX "lulusMK_MKId_idx" ON "lulusMK"("MKId");

-- CreateIndex
CREATE INDEX "lulusMK_tahunAjaranId_idx" ON "lulusMK"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusMK_MKId_tahunAjaranId_key" ON "lulusMK"("MKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "rencanaPembelajaran_id_key" ON "rencanaPembelajaran"("id");

-- CreateIndex
CREATE INDEX "rencanaPembelajaran_templatePenilaianCPMKId_idx" ON "rencanaPembelajaran"("templatePenilaianCPMKId");

-- CreateIndex
CREATE INDEX "rencanaPembelajaran_penilaianCPMKId_idx" ON "rencanaPembelajaran"("penilaianCPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "rencanaPembelajaran_minggu_templatePenilaianCPMKId_key" ON "rencanaPembelajaran"("minggu", "templatePenilaianCPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "penilaianRP_id_key" ON "penilaianRP"("id");

-- CreateIndex
CREATE INDEX "penilaianRP_rencanaPembelajaranId_idx" ON "penilaianRP"("rencanaPembelajaranId");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_id_key" ON "kelas"("id");

-- CreateIndex
CREATE INDEX "kelas_MKId_idx" ON "kelas"("MKId");

-- CreateIndex
CREATE INDEX "kelas_tahunAjaranId_idx" ON "kelas"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "kelas_templatePenilaianCPMKId_idx" ON "kelas"("templatePenilaianCPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_nama_MKId_tahunAjaranId_key" ON "kelas"("nama", "MKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluasiCPMKKelas_id_key" ON "evaluasiCPMKKelas"("id");

-- CreateIndex
CREATE INDEX "evaluasiCPMKKelas_kelasId_idx" ON "evaluasiCPMKKelas"("kelasId");

-- CreateIndex
CREATE INDEX "evaluasiCPMKKelas_CPMKId_idx" ON "evaluasiCPMKKelas"("CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluasiCPMKKelas_kelasId_CPMKId_key" ON "evaluasiCPMKKelas"("kelasId", "CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluasiCPLKelas_id_key" ON "evaluasiCPLKelas"("id");

-- CreateIndex
CREATE INDEX "evaluasiCPLKelas_kelasId_idx" ON "evaluasiCPLKelas"("kelasId");

-- CreateIndex
CREATE INDEX "evaluasiCPLKelas_CPLId_idx" ON "evaluasiCPLKelas"("CPLId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluasiCPLKelas_kelasId_CPLId_key" ON "evaluasiCPLKelas"("kelasId", "CPLId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusKelas_CPMK_id_key" ON "lulusKelas_CPMK"("id");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_kelasId_idx" ON "lulusKelas_CPMK"("kelasId");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_CPMKId_idx" ON "lulusKelas_CPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_tahunAjaranId_idx" ON "lulusKelas_CPMK"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusKelas_CPMK_kelasId_CPMKId_tahunAjaranId_key" ON "lulusKelas_CPMK"("kelasId", "CPMKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "CPMK_id_key" ON "CPMK"("id");

-- CreateIndex
CREATE INDEX "CPMK_prodiId_idx" ON "CPMK"("prodiId");

-- CreateIndex
CREATE INDEX "CPMK_CPLKode_idx" ON "CPMK"("CPLKode");

-- CreateIndex
CREATE UNIQUE INDEX "CPMK_kode_prodiId_key" ON "CPMK"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusCPMK_id_key" ON "lulusCPMK"("id");

-- CreateIndex
CREATE INDEX "lulusCPMK_CPMKId_idx" ON "lulusCPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusCPMK_tahunAjaranId_idx" ON "lulusCPMK"("tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "lulusCPMK_CPMKId_tahunAjaranId_key" ON "lulusCPMK"("CPMKId", "tahunAjaranId");

-- CreateIndex
CREATE UNIQUE INDEX "penilaianCPMK_id_key" ON "penilaianCPMK"("id");

-- CreateIndex
CREATE INDEX "penilaianCPMK_CPLkode_idx" ON "penilaianCPMK"("CPLkode");

-- CreateIndex
CREATE INDEX "penilaianCPMK_CPMKkode_idx" ON "penilaianCPMK"("CPMKkode");

-- CreateIndex
CREATE INDEX "penilaianCPMK_prodiId_idx" ON "penilaianCPMK"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "penilaianCPMK_kode_prodiId_key" ON "penilaianCPMK"("kode", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_id_key" ON "mahasiswa_MK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_mahasiswaNim_idx" ON "mahasiswa_MK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_MKId_idx" ON "mahasiswa_MK"("MKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_mahasiswaNim_MKId_key" ON "mahasiswa_MK"("mahasiswaNim", "MKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_CPMK_id_key" ON "mahasiswa_MK_CPMK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_mahasiswaNim_idx" ON "mahasiswa_MK_CPMK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_MKId_idx" ON "mahasiswa_MK_CPMK"("MKId");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_CPMK_CPMKId_idx" ON "mahasiswa_MK_CPMK"("CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_CPMK_mahasiswaNim_MKId_CPMKId_key" ON "mahasiswa_MK_CPMK"("mahasiswaNim", "MKId", "CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_CPMK_id_key" ON "mahasiswa_CPMK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_CPMK_mahasiswaNim_idx" ON "mahasiswa_CPMK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_CPMK_CPMKId_idx" ON "mahasiswa_CPMK"("CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_CPMK_mahasiswaNim_CPMKId_key" ON "mahasiswa_CPMK"("mahasiswaNim", "CPMKId");

-- CreateIndex
CREATE UNIQUE INDEX "performaMahasiswa_id_key" ON "performaMahasiswa"("id");

-- CreateIndex
CREATE INDEX "performaMahasiswa_mahasiswaNim_idx" ON "performaMahasiswa"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "performaMahasiswa_CPLId_idx" ON "performaMahasiswa"("CPLId");

-- CreateIndex
CREATE UNIQUE INDEX "performaMahasiswa_mahasiswaNim_CPLId_key" ON "performaMahasiswa"("mahasiswaNim", "CPLId");

-- CreateIndex
CREATE UNIQUE INDEX "inputNilai_id_key" ON "inputNilai"("id");

-- CreateIndex
CREATE INDEX "inputNilai_prodiId_idx" ON "inputNilai"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "inputNilai_penilaianCPMKId_mahasiswaNim_kelasId_key" ON "inputNilai"("penilaianCPMKId", "mahasiswaNim", "kelasId");

-- CreateIndex
CREATE INDEX "_kelas_dosen_B_index" ON "_kelas_dosen"("B");

-- CreateIndex
CREATE INDEX "_cpl_pl_B_index" ON "_cpl_pl"("B");

-- CreateIndex
CREATE INDEX "_cpl_bk_B_index" ON "_cpl_bk"("B");

-- CreateIndex
CREATE INDEX "_bk_mk_B_index" ON "_bk_mk"("B");

-- CreateIndex
CREATE INDEX "_Prerequisites_B_index" ON "_Prerequisites"("B");

-- CreateIndex
CREATE INDEX "_kelas_mahasiswa_B_index" ON "_kelas_mahasiswa"("B");

-- CreateIndex
CREATE INDEX "_cpmk_mk_B_index" ON "_cpmk_mk"("B");

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_kaprodiId_fkey" FOREIGN KEY ("kaprodiId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_GKMPId_fkey" FOREIGN KEY ("GKMPId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelompokKeahlian" ADD CONSTRAINT "kelompokKeahlian_ketuaId_fkey" FOREIGN KEY ("ketuaId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelompokKeahlian" ADD CONSTRAINT "kelompokKeahlian_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PL" ADD CONSTRAINT "PL_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPL" ADD CONSTRAINT "CPL_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaCPL" ADD CONSTRAINT "performaCPL_CPLId_fkey" FOREIGN KEY ("CPLId") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaCPL" ADD CONSTRAINT "performaCPL_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BK" ADD CONSTRAINT "BK_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MK" ADD CONSTRAINT "MK_KKId_fkey" FOREIGN KEY ("KKId") REFERENCES "kelompokKeahlian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MK" ADD CONSTRAINT "MK_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templatePenilaianCPMK" ADD CONSTRAINT "templatePenilaianCPMK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps" ADD CONSTRAINT "rps_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps" ADD CONSTRAINT "rps_pengembangId_fkey" FOREIGN KEY ("pengembangId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusMK_CPMK" ADD CONSTRAINT "lulusMK_CPMK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusMK_CPMK" ADD CONSTRAINT "lulusMK_CPMK_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusMK_CPMK" ADD CONSTRAINT "lulusMK_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusMK" ADD CONSTRAINT "lulusMK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusMK" ADD CONSTRAINT "lulusMK_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rencanaPembelajaran" ADD CONSTRAINT "rencanaPembelajaran_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rencanaPembelajaran" ADD CONSTRAINT "rencanaPembelajaran_penilaianCPMKId_fkey" FOREIGN KEY ("penilaianCPMKId") REFERENCES "penilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianRP" ADD CONSTRAINT "penilaianRP_rencanaPembelajaranId_fkey" FOREIGN KEY ("rencanaPembelajaranId") REFERENCES "rencanaPembelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluasiCPMKKelas" ADD CONSTRAINT "evaluasiCPMKKelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluasiCPMKKelas" ADD CONSTRAINT "evaluasiCPMKKelas_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluasiCPLKelas" ADD CONSTRAINT "evaluasiCPLKelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluasiCPLKelas" ADD CONSTRAINT "evaluasiCPLKelas_CPLId_fkey" FOREIGN KEY ("CPLId") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusKelas_CPMK" ADD CONSTRAINT "lulusKelas_CPMK_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusKelas_CPMK" ADD CONSTRAINT "lulusKelas_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusKelas_CPMK" ADD CONSTRAINT "lulusKelas_CPMK_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPMK" ADD CONSTRAINT "CPMK_CPLKode_fkey" FOREIGN KEY ("CPLKode") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPMK" ADD CONSTRAINT "CPMK_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusCPMK" ADD CONSTRAINT "lulusCPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lulusCPMK" ADD CONSTRAINT "lulusCPMK_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_CPLkode_fkey" FOREIGN KEY ("CPLkode") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_MKkode_fkey" FOREIGN KEY ("MKkode") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_CPMKkode_fkey" FOREIGN KEY ("CPMKkode") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaianCPMK" ADD CONSTRAINT "penilaianCPMK_templatePenilaianCPMKId_fkey" FOREIGN KEY ("templatePenilaianCPMKId") REFERENCES "templatePenilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK" ADD CONSTRAINT "mahasiswa_MK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK" ADD CONSTRAINT "mahasiswa_MK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK_CPMK" ADD CONSTRAINT "mahasiswa_MK_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_CPMK" ADD CONSTRAINT "mahasiswa_CPMK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_CPMK" ADD CONSTRAINT "mahasiswa_CPMK_CPMKId_fkey" FOREIGN KEY ("CPMKId") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaMahasiswa" ADD CONSTRAINT "performaMahasiswa_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performaMahasiswa" ADD CONSTRAINT "performaMahasiswa_CPLId_fkey" FOREIGN KEY ("CPLId") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_penilaianCPMKId_fkey" FOREIGN KEY ("penilaianCPMKId") REFERENCES "penilaianCPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inputNilai" ADD CONSTRAINT "inputNilai_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "prodi"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kelas_dosen" ADD CONSTRAINT "_kelas_dosen_A_fkey" FOREIGN KEY ("A") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kelas_dosen" ADD CONSTRAINT "_kelas_dosen_B_fkey" FOREIGN KEY ("B") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_pl" ADD CONSTRAINT "_cpl_pl_A_fkey" FOREIGN KEY ("A") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_pl" ADD CONSTRAINT "_cpl_pl_B_fkey" FOREIGN KEY ("B") REFERENCES "PL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_bk" ADD CONSTRAINT "_cpl_bk_A_fkey" FOREIGN KEY ("A") REFERENCES "BK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_bk" ADD CONSTRAINT "_cpl_bk_B_fkey" FOREIGN KEY ("B") REFERENCES "CPL"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bk_mk" ADD CONSTRAINT "_bk_mk_A_fkey" FOREIGN KEY ("A") REFERENCES "BK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bk_mk" ADD CONSTRAINT "_bk_mk_B_fkey" FOREIGN KEY ("B") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prerequisites" ADD CONSTRAINT "_Prerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prerequisites" ADD CONSTRAINT "_Prerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kelas_mahasiswa" ADD CONSTRAINT "_kelas_mahasiswa_A_fkey" FOREIGN KEY ("A") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_kelas_mahasiswa" ADD CONSTRAINT "_kelas_mahasiswa_B_fkey" FOREIGN KEY ("B") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_mk" ADD CONSTRAINT "_cpmk_mk_A_fkey" FOREIGN KEY ("A") REFERENCES "CPMK"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_mk" ADD CONSTRAINT "_cpmk_mk_B_fkey" FOREIGN KEY ("B") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
