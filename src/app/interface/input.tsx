import { tahunAjaranItem } from "../dashboard/details/mk/[kode]/page";

export interface accountProdi {
  id: string;
  nama: string;
  role: string;
  prodiId: string;
  kelas: kelasItem[];
}

export interface kelasItem {
  id: number;
  nama: string;
  MK: MKItem;
  MKId: string;
  mahasiswa: mahasiswaItem[];
  tahunAjaran: tahunAjaranItem
}

export interface MKItem {
  kode: string;
  deskripsi: string;
  kelas: kelasItem[];
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
}
