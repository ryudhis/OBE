export interface accountProdi {
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
