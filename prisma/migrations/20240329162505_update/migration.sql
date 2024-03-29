-- CreateTable
CREATE TABLE "subCPMK" (
    "kode" STRING NOT NULL,
    "deskripsi" STRING NOT NULL,

    CONSTRAINT "subCPMK_pkey" PRIMARY KEY ("kode")
);

-- CreateTable
CREATE TABLE "_cpmk_subcpmk" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "subCPMK_kode_key" ON "subCPMK"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "_cpmk_subcpmk_AB_unique" ON "_cpmk_subcpmk"("A", "B");

-- CreateIndex
CREATE INDEX "_cpmk_subcpmk_B_index" ON "_cpmk_subcpmk"("B");

-- AddForeignKey
ALTER TABLE "_cpmk_subcpmk" ADD CONSTRAINT "_cpmk_subcpmk_A_fkey" FOREIGN KEY ("A") REFERENCES "CPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cpmk_subcpmk" ADD CONSTRAINT "_cpmk_subcpmk_B_fkey" FOREIGN KEY ("B") REFERENCES "subCPMK"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
