/*
  Warnings:

  - You are about to drop the `kelas_mahasiswa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "kelas_mahasiswa" DROP CONSTRAINT "kelas_mahasiswa_MKId_fkey";

-- DropForeignKey
ALTER TABLE "kelas_mahasiswa" DROP CONSTRAINT "kelas_mahasiswa_kelasId_fkey";

-- DropForeignKey
ALTER TABLE "kelas_mahasiswa" DROP CONSTRAINT "kelas_mahasiswa_mahasiswaNim_fkey";

-- DropTable
DROP TABLE "kelas_mahasiswa";
