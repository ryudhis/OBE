export {};

import type * as Prisma from "@prisma/client";

declare global {
  export interface DataCount {
    name: string;
    count: number;
  }

  export interface DataCPMK {
    id: string;
    cpmk: string;
    cpl: string;
    nilaiMinimal: number;
    nilaiMasuk: number;
    jumlahLulus: number;
    persenLulus: number;
    rataNilai: number;
  }

  export interface PerformaKelas {
    id: string;
    nama: string;
    tahunAjaranId: number;
    mahasiswaCount: number;
    dataCPMK: DataCPMK[];
  }

  export interface PerformaCPMKResponse {
    id: string;
    kode: string;
    kelas: PerformaKelas[];
  }

  export interface LulusMK_CPMK {
    id: string;
    MKId: string;
    jumlahLulus: number;
    tahunAjaranId: number;
  }

  export interface LulusCPMK {
    id: string;
    jumlahLulus: number;
    tahunAjaranId: number;
  }

  export interface PerformaCPMK {
    id: string;
    kode: string;
    lulusMK_CPMK: LulusMK_CPMK[];
    lulusCPMK: LulusCPMK[];
  }

  export interface PerformaCPL {
    id: string;
    kode: string;
    CPMK: PerformaCPMK[];
  }

  export interface CalculatedPerformaCPL {
    kode: string;
    nilai: string;
    value?: number;
    CPMK: CalculatedPerformaCPMK[];
  }

  export interface CalculatedPerformaCPMK {
    kode: string;
    nilai: string;
    value?: number;
    MK: CalculatedPerformaMK[];
  }

  export interface CalculatedPerformaMK {
    kode: string;
    nilai: string;
    value?: number;
  }

  export interface RangkumanPerformaResponse {
    status: number;
    message: string;
    data: PerformaCPL[];
  }

  export interface TahunAjaran {
    id: number;
    tahun: string;
    semester: string;
    kelas: Kelas[];
    lulusMK: LulusMK[];
    lulusCPMK: LulusCPMK[];
    lulusMK_CPMK: LulusMK_CPMK[];
    lulusKelas_CPMK: LulusKelas_CPMK[];
    performaCPL: PerformaCPL[];
  }

  export interface performaMahasiswa extends Prisma.performaMahasiswa {
    CPL: CPL;
  }

  export interface Prodi {
    kode: string;
    nama: string;
    tendik: Account[];
    kaprodi?: Account;
    kaprodiId?: number;
    PL: PL[];
    CPL: CPL[];
    BK: BK[];
    MK: MK[];
    CPMK: CPMK[];
    mahasiswa: Mahasiswa[];
    PCPMK: PenilaianCPMK[];
    nilai: InputNilai[];
    KK: KelompokKeahlian[];
    GKMP: Account;
    GKMPId?: number;
  }

  export interface KelompokKeahlian {
    id: number;
    nama: string;
    ketua?: Account;
    ketuaId?: number;
    prodi: Prodi;
    prodiId: string;
    MK: MK[];
  }

  export interface Account {
    id: number;
    nama: string;
    email: string;
    role: string;
    password: string;
    kelas: Kelas[];
    prodi: Prodi;
    prodiId: string;
    ketuaProdi?: Prodi;
    KK?: KelompokKeahlian;
    rps: RPS[];
    signature?: string;
  }

  export interface Kunci {
    id: number;
    data: boolean;
    nilai: boolean;
  }

  export interface PL {
    id: number;
    kode: string;
    deskripsi: string;
    CPL: CPL[];
    prodi?: Prodi;
    prodiId?: string;
  }

  export interface CPL {
    id: number;
    kode: string;
    deskripsi: string;
    keterangan: string;
    deskripsiInggris: string;
    BK: BK[];
    PL: PL[];
    CPMK: CPMK[];
    penilaianCPMK: PenilaianCPMK[];
    prodi: Prodi;
    prodiId: string;
    performaCPL: PerformaCPL[];
  }

  export interface PerformaCPL {
    id: number;
    performa: number;
    CPL: CPL;
    CPLId: number;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
  }

  export interface BK {
    id: number;
    kode: string;
    deskripsi: string;
    min: number;
    max: number;
    CPL: CPL[];
    MK: MK[];
    prodi: Prodi;
    prodiId: string;
  }

  export interface MK {
    kode: string;
    deskripsi: string;
    deskripsiInggris: string;
    sks: string;
    semester: string;
    batasLulusMahasiswa: number;
    batasLulusMK: number;
    lulusMK: LulusMK[];
    lulusMK_CPMK: LulusMK_CPMK[];
    kelas: Kelas[];
    BK: BK[];
    CPMK: CPMK[];
    penilaianCPMK: PenilaianCPMK[];
    templatePenilaianCPMK: TemplatePenilaianCPMK[];
    KK: KelompokKeahlian;
    KKId: number;
    prodi: Prodi;
    prodiId: string;
    rps?: RPS;
    prerequisitesMK: MK[];
    isPrerequisiteFor: MK[];
  }

  export interface RPS {
    id: number;
    MK: MK;
    MKId: string;
    pengembang?: Account;
    pengembangId?: number;
    deskripsi: string;
    materiPembelajaran: string;
    pustakaUtama: string[];
    pustakaPendukung: string[];
    software: string;
    hardware: string;
    revisi: string;
    signaturePengembang?: string;
    signatureKaprodi?: string;
    signatureGKMP?: string;
    signatureKetuaKK?: string;
  }

  export interface LulusMK_CPMK {
    id: number;
    MK: MK;
    MKId: string;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
    CPMK: CPMK;
    CPMKId: number;
    jumlahLulus: number;
  }

  export interface LulusMK {
    id: number;
    MK: MK;
    MKId: string;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
    jumlahLulus: number;
    persentaseLulus: number;
  }

  export interface RencanaPembelajaran {
    id: number;
    minggu: number;
    bahanKajian: string;
    bentuk: string;
    metode: string;
    sumber: string;
    waktu: string;
    pengalaman: string;
    templatePenilaianCPMK: TemplatePenilaianCPMK;
    templatePenilaianCPMKId: number;
    penilaianCPMK: PenilaianCPMK;
    penilaianCPMKId: number;
    penilaianRP: any[];
  }

  export interface penilaianRP {
    id: number;
    kriteria: string;
    indikator: string;
    bobot: number;
    rencanaPembelajaran: RencanaPembelajaran;
    rencanaPembelajaranId: number;
  }

  export interface Kelas {
    id: number;
    nama: string;
    MK: MK;
    MKId: string;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
    mahasiswa: Mahasiswa[];
    nilaiMahasiswa: InputNilai[];
    dosen: Account[];
    jumlahLulus: number;
    mahasiswaLulus?: mahasiswaLulus[];
    mahasiswaPerbaikan?: mahasiswaLulus[];
    dataCPMK?: dataCPMK[];
    dataCPL?: dataCPL[];
    evaluasiCPMK: evaluasiCPMK[];
    evaluasiCPL: evaluasiCPL[];
    tindakLanjutCPMK?: string;
    tindakLanjutCPL?: string;
    lulusCPMK: LulusKelas_CPMK[];
    templatePenilaianCPMK: TemplatePenilaianCPMK;
  }

  export interface evaluasiCPMK {
    id: number;
    kelas: Kelas;
    kelasId: number;
    CPMK: CPMK;
    CPMKId: number;
    evaluasi: string;
  }

  export interface evaluasiCPL {
    id: number;
    kelas: Kelas;
    kelasId: number;
    CPL: CPL;
    CPLId: number;
    evaluasi: string;
  }

  export interface dataCPMK {
    cpmkId: number;
    cpmk: string;
    cpl: string;
    nilaiMinimal: number;
    nilaiMasuk: number;
    jumlahLulus: number;
    persenLulus: number;
    rataNilai: number;
  }

  export interface dataCPL {
    cplId: number;
    cpl: string;
    nilaiMinimal: number;
    nilaiMasuk: number;
    jumlahLulus: number;
    persenLulus: number;
    rataNilai: number;
  }

  export interface mahasiswaLulus {
    nama: string;
    nim: string;
    totalNilai: number;
    statusLulus: string;
    statusCPMK: statusCPMK[];
    nilaiMahasiswa: nilaiMahasiswa[];
    nilaiKriteria: nilaiKriteria[];
    indexNilai: string;
  }

  export interface nilaiKriteria {
    kriteria: string;
    nilai: number;
  }

  export interface statusCPMK {
    nilaiId: number;
    namaCPMK: string;
    nilaiCPMK: number;
    statusLulus: string;
    kriteria: string[];
  }

  export interface nilaiMahasiswa {
    nilai: number[];
    totalNilai: number;
    namaCPMK: string;
    batasNilai: number;
  }

  export interface LulusKelas_CPMK {
    id: number;
    kelas: Kelas;
    kelasId: number;
    CPMK: CPMK;
    CPMKId: number;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
    jumlahLulus: number;
  }

  export interface CPMK {
    id: number;
    kode: string;
    deskripsi: string;
    CPL: CPL;
    CPLKode: number;
    MK: MK[];
    penilaianCPMK: PenilaianCPMK[];
    prodi: Prodi;
    prodiId: string;
    lulusKelasCPMK: LulusKelas_CPMK[];
    lulusCPMK: LulusCPMK[];
    lulusMK_CPMK: LulusMK_CPMK[];
  }

  export interface LulusCPMK {
    id: number;
    CPMK: CPMK;
    CPMKId: number;
    tahunAjaran: TahunAjaran;
    tahunAjaranId: number;
    jumlahLulus: number;
  }

  export interface TemplatePenilaianCPMK {
    id: number;
    template: string;
    active: boolean;
    MKId: string;
    penilaianCPMK: PenilaianCPMK[];
    rencanaPembelajaran: RencanaPembelajaran[];
  }

  export interface PenilaianCPMK {
    id: number;
    kode: string;
    CPL: CPL;
    CPLkode: number;
    MK: MK;
    MKkode: string;
    CPMK: CPMK;
    CPMKkode: number;
    tahapPenilaian: string;
    teknikPenilaian: string;
    instrumen: string;
    batasNilai: number;
    kriteria: Kriteria[];
    inputNilai: InputNilai[];
    prodi: Prodi;
    prodiId: string;
    templatePenilaianCPMKId: number;
  }

  export interface Kriteria {
    id: number;
    kriteria: string;
    bobot: number;
  }

  export interface Mahasiswa {
    nim: string;
    nama: string;
    kelas: Kelas[];
    inputNilai: InputNilai[];
    prodi: Prodi;
    prodiId: string;
    performaMahasiswa: performaMahasiswa[];
    mahasiswa_CPMK: Mahasiswa_CPMK[];
    mahasiswa_MK_CPMK: Mahasiswa_MK_CPMK[];
    mahasiswa_MK: Mahasiswa_MK[];
  }

  export interface InputNilai {
    id: number;
    penilaianCPMK: PenilaianCPMK;
    penilaianCPMKId: number;
    mahasiswa: Mahasiswa;
    mahasiswaNim: string;
    kelas: Kelas;
    kelasId: number;
    nilai: number[];
    prodi: Prodi;
    prodiId: string;
  }
}
