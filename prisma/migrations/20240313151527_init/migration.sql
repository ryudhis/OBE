-- AlterSequence
ALTER SEQUENCE "Admin_id_seq" MAXVALUE 9223372036854775807;

-- CreateTable
CREATE TABLE "PL" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,

    CONSTRAINT "PL_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "CPL" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,
    "keterangan" STRING NOT NULL,

    CONSTRAINT "CPL_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "BK" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,
    "min" INT4 NOT NULL,
    "max" INT4 NOT NULL,

    CONSTRAINT "BK_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "MK" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,

    CONSTRAINT "MK_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "CPMK" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,

    CONSTRAINT "CPMK_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "_cpl_pl" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_cpmk_cpl" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_cpl_bk" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_bk_mk" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_cpmk_mk" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PL_kode_key" ON "PL"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "CPL_kode_key" ON "CPL"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "BK_kode_key" ON "BK"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "MK_kode_key" ON "MK"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "CPMK_kode_key" ON "CPMK"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "_cpl_pl_AB_unique" ON "_cpl_pl"("A", "B");

-- CreateIndex
CREATE INDEX "_cpl_pl_B_index" ON "_cpl_pl"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_cpmk_cpl_AB_unique" ON "_cpmk_cpl"("A", "B");

-- CreateIndex
CREATE INDEX "_cpmk_cpl_B_index" ON "_cpmk_cpl"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_cpl_bk_AB_unique" ON "_cpl_bk"("A", "B");

-- CreateIndex
CREATE INDEX "_cpl_bk_B_index" ON "_cpl_bk"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_bk_mk_AB_unique" ON "_bk_mk"("A", "B");

-- CreateIndex
CREATE INDEX "_bk_mk_B_index" ON "_bk_mk"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_cpmk_mk_AB_unique" ON "_cpmk_mk"("A", "B");

-- CreateIndex
CREATE INDEX "_cpmk_mk_B_index" ON "_cpmk_mk"("B");

-- AddForeignKey
ALTER TABLE "_cpl_pl" ADD CONSTRAINT "_cpl_pl_A_fkey" FOREIGN KEY ("A") REFERENCES "CPL"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_pl" ADD CONSTRAINT "_cpl_pl_B_fkey" FOREIGN KEY ("B") REFERENCES "PL"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_cpl" ADD CONSTRAINT "_cpmk_cpl_A_fkey" FOREIGN KEY ("A") REFERENCES "CPL"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_cpl" ADD CONSTRAINT "_cpmk_cpl_B_fkey" FOREIGN KEY ("B") REFERENCES "CPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_bk" ADD CONSTRAINT "_cpl_bk_A_fkey" FOREIGN KEY ("A") REFERENCES "BK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpl_bk" ADD CONSTRAINT "_cpl_bk_B_fkey" FOREIGN KEY ("B") REFERENCES "CPL"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bk_mk" ADD CONSTRAINT "_bk_mk_A_fkey" FOREIGN KEY ("A") REFERENCES "BK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bk_mk" ADD CONSTRAINT "_bk_mk_B_fkey" FOREIGN KEY ("B") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_mk" ADD CONSTRAINT "_cpmk_mk_A_fkey" FOREIGN KEY ("A") REFERENCES "CPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_mk" ADD CONSTRAINT "_cpmk_mk_B_fkey" FOREIGN KEY ("B") REFERENCES "MK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
