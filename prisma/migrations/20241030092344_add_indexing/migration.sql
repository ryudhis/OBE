-- CreateIndex
CREATE INDEX "BK_prodiId_idx" ON "BK"("prodiId");

-- CreateIndex
CREATE INDEX "CPL_prodiId_idx" ON "CPL"("prodiId");

-- CreateIndex
CREATE INDEX "CPMK_prodiId_idx" ON "CPMK"("prodiId");

-- CreateIndex
CREATE INDEX "CPMK_CPLKode_idx" ON "CPMK"("CPLKode");

-- CreateIndex
CREATE INDEX "MK_KKId_idx" ON "MK"("KKId");

-- CreateIndex
CREATE INDEX "MK_prodiId_idx" ON "MK"("prodiId");

-- CreateIndex
CREATE INDEX "PL_prodiId_idx" ON "PL"("prodiId");

-- CreateIndex
CREATE INDEX "account_prodiId_idx" ON "account"("prodiId");

-- CreateIndex
CREATE INDEX "inputNilai_prodiId_idx" ON "inputNilai"("prodiId");

-- CreateIndex
CREATE INDEX "kelas_MKId_idx" ON "kelas"("MKId");

-- CreateIndex
CREATE INDEX "kelas_tahunAjaranId_idx" ON "kelas"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "kelompokKeahlian_prodiId_idx" ON "kelompokKeahlian"("prodiId");

-- CreateIndex
CREATE INDEX "lulusCPMK_CPMKId_idx" ON "lulusCPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusCPMK_tahunAjaranId_idx" ON "lulusCPMK"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_kelasId_idx" ON "lulusKelas_CPMK"("kelasId");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_CPMKId_idx" ON "lulusKelas_CPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusKelas_CPMK_tahunAjaranId_idx" ON "lulusKelas_CPMK"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "lulusMK_MKId_idx" ON "lulusMK"("MKId");

-- CreateIndex
CREATE INDEX "lulusMK_tahunAjaranId_idx" ON "lulusMK"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_MKId_idx" ON "lulusMK_CPMK"("MKId");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_CPMKId_idx" ON "lulusMK_CPMK"("CPMKId");

-- CreateIndex
CREATE INDEX "lulusMK_CPMK_tahunAjaranId_idx" ON "lulusMK_CPMK"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "penilaianCPMK_CPLkode_idx" ON "penilaianCPMK"("CPLkode");

-- CreateIndex
CREATE INDEX "penilaianCPMK_CPMKkode_idx" ON "penilaianCPMK"("CPMKkode");

-- CreateIndex
CREATE INDEX "penilaianCPMK_prodiId_idx" ON "penilaianCPMK"("prodiId");

-- CreateIndex
CREATE INDEX "performaCPL_CPLId_idx" ON "performaCPL"("CPLId");

-- CreateIndex
CREATE INDEX "performaCPL_tahunAjaranId_idx" ON "performaCPL"("tahunAjaranId");
