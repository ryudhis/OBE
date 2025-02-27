export {};

import type * as Prisma from "@prisma/client";

declare global {
  export interface DataCount {
    name: string;
    count: number;
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
    KK: KelompokKeahlian;
    KKId: number;
    prodi: Prodi;
    prodiId: string;
    rencanaPembelajaran: RencanaPembelajaran[];
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
    pustakaUtama: string[];
    pustakaPendukung: string[];
    software: string;
    hardware: string;
    revisi: string;
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
    materi: string;
    metode: string;
    MK: MK;
    MKId: string;
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
    dataCPMK?: dataCPMK[];
    dataCPL?: dataCPL[];
    evaluasiCPMK: evaluasiCPMK[];
    evaluasiCPL: evaluasiCPL[];
    tindakLanjutCPMK?: string;
    tindakLanjutCPL?: string;
    lulusCPMK: LulusKelas_CPMK[];
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
    nim: string;
    totalNilai: number;
    statusLulus: string;
    statusCPMK: statusCPMK[];
    nilaiMahasiswa: nilaiMahasiswa[];
    indexNilai: string;
  }

  export interface statusCPMK {
    namaCPMK: string;
    nilaiCPMK: number;
    statusLulus: string;
  }

  export interface nilaiMahasiswa {
    nilai: number[];
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
  }

  export interface Kriteria {
    bobot: number;
    kriteria: string;
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
