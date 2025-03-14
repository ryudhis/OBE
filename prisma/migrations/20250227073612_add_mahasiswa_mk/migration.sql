-- AlterSequence
ALTER SEQUENCE "BK_id_seq" MAXVALUE 9223372036854775807;

-- CreateTable
CREATE TABLE "mahasiswa_MK" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "mahasiswaNim" STRING NOT NULL,
    "MKId" STRING NOT NULL,
    "nilai" FLOAT8 NOT NULL,

    CONSTRAINT "mahasiswa_MK_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_id_key" ON "mahasiswa_MK"("id");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_mahasiswaNim_idx" ON "mahasiswa_MK"("mahasiswaNim");

-- CreateIndex
CREATE INDEX "mahasiswa_MK_MKId_idx" ON "mahasiswa_MK"("MKId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_MK_mahasiswaNim_MKId_key" ON "mahasiswa_MK"("mahasiswaNim", "MKId");

-- AddForeignKey
ALTER TABLE "mahasiswa_MK" ADD CONSTRAINT "mahasiswa_MK_mahasiswaNim_fkey" FOREIGN KEY ("mahasiswaNim") REFERENCES "mahasiswa"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_MK" ADD CONSTRAINT "mahasiswa_MK_MKId_fkey" FOREIGN KEY ("MKId") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
