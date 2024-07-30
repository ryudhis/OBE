"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/app/contexts/AccountContext";

export interface mk {
  kode: string;
  deskripsi: string;
  deskripsiInggris: string;
  CPMK: CPMKItem[];
  jumlahLulus: number;
  batasLulusMK: number;
  kelas: kelasItem[];
  // mahasiswa: MahasiswaItem[];
}

export interface MahasiswaItem {
  nim: string;
  nama: string;
}

export interface kelasItem {
  nama: string;
  mahasiswa: MahasiswaItem[];
}

export interface CPMKItem {
  kode: string;
}

const DataMK = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [MK, setMK] = useState<mk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const getMK = async (prodiId: string = "", dosenId: string = "") => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${prodiId}${dosenId ? `&dosen=${dosenId}` : ""}`
      );
      if (response.data.status !== 400) {
        setMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const delMK = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/mk/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data MK",
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (accountData?.role === "Dosen") {
      getMK(accountData.prodiId, accountData.id);
    } else {
      getMK(accountData?.prodiId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]); // Trigger useEffect only on initial mount

  let jumlahMahasiswa: number = 0;
  const renderData = () => {
    if (MK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center">
            Tidak ada data
          </TableCell>
        </TableRow>
      );
    }

    return MK.map((mk) => {
      jumlahMahasiswa = 0;
      {
        mk.kelas.map((kelas) => (jumlahMahasiswa += kelas.mahasiswa.length));
      }
      return (
        <TableRow key={mk.kode}>
          <TableCell className="w-[8%] text-center">{mk.kode}</TableCell>
          <TableCell className="flex-1 text-center">
            {mk.deskripsi.length > 20
              ? mk.deskripsi.slice(0, 18) + "..."
              : mk.deskripsi}
          </TableCell>
          <TableCell className="flex-1 text-center">
            {mk.deskripsiInggris.length > 20
              ? mk.deskripsiInggris.slice(0, 18) + "..."
              : mk.deskripsiInggris}
          </TableCell>
          <TableCell className="w-[15%] text-center">
            {mk.CPMK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[8%] text-center">
            {jumlahMahasiswa}
          </TableCell>
          <TableCell className="w-[8%] text-center">
            {/* {mk.jumlahLulus} */}
          </TableCell>
          <TableCell className="w-[8%] text-center">
            {/* {jumlahMahasiswa > 0
              ? ((mk.jumlahLulus / jumlahMahasiswa) * 100).toFixed(2) + "%"
              : "0.00%"} */}
          </TableCell>
          <TableCell className="w-[8%] text-center">
            {mk.batasLulusMK}%
          </TableCell>
          <TableCell className="w-[8%] text-center">
            {/* {(mk.jumlahLulus / jumlahMahasiswa) * 100 >= mk.batasLulusMK
              ? "Lulus"
              : "Tidak Lulus"} */}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2 text-center">
            <Button variant="destructive" onClick={() => delMK(mk.kode)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/mk/${mk.kode}/`);
              }}
            >
              Details
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <section className="flex justify-center items-center mt-20">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel MK</CardTitle>
            <CardDescription>Mata Kuliah</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/mk");
            }}
          >
            Tambah
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%] text-center">Kode</TableHead>
                  <TableHead className="flex-1 text-center">
                    Nama Matakuliah
                  </TableHead>
                  <TableHead className="flex-1 text-center">
                    Nama Matakuliah Inggris
                  </TableHead>
                  <TableHead className="w-[15%] text-center">CPMK</TableHead>
                  <TableHead className="w-[8%] text-center">
                    Jumlah Mahasiswa
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Jumlah Lulus
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Persentase Lulus
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Batas Lulus MK
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Status MK
                  </TableHead>
                  <TableHead className="w-[8%] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={11} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%] text-center">Kode</TableHead>
                  <TableHead className="flex-1 text-center">
                    Nama Matakuliah
                  </TableHead>
                  <TableHead className="flex-1 text-center">
                    Nama Matakuliah Inggris
                  </TableHead>
                  <TableHead className="w-[15%] text-center">CPMK</TableHead>
                  <TableHead className="w-[8%] text-center">
                    Jumlah Mahasiswa
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Jumlah Lulus
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Persentase Lulus
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Batas Lulus MK
                  </TableHead>
                  <TableHead className="w-[8%] text-center">
                    Status MK
                  </TableHead>
                  <TableHead className="w-[8%] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderData()}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default DataMK;
