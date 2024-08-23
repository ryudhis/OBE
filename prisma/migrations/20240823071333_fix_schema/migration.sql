-- DropForeignKey
ALTER TABLE "kelompokKeahlian" DROP CONSTRAINT "kelompokKeahlian_ketuaId_fkey";

-- DropForeignKey
ALTER TABLE "prodi" DROP CONSTRAINT "prodi_kaprodiId_fkey";

-- AlterTable
ALTER TABLE "kelompokKeahlian" ALTER COLUMN "ketuaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "prodi" ALTER COLUMN "kaprodiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_kaprodiId_fkey" FOREIGN KEY ("kaprodiId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelompokKeahlian" ADD CONSTRAINT "kelompokKeahlian_ketuaId_fkey" FOREIGN KEY ("ketuaId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
