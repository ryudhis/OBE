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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";

export interface mk {
  kode: string;
  deskripsi: string;
  deskripsiInggris: string;
  CPMK: CPMKItem[];
  jumlahLulus: number;
  batasLulusMK: number;
  kelas: kelasItem[];
  lulusMK: lulusMKItem[];
  // mahasiswa: MahasiswaItem[];
}

export interface tahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export interface lulusMKItem {
  id: number;
  tahunAjaranId: number;
  jumlahLulus: number;
  persentaseLulus: number;
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
  const [tahunAjaran, setTahunAjaran] = useState<tahunAjaran[]>([]);
  const [selectedTahun, setSelectedTahun] = useState("");
  const [refresh, setRefresh] = useState(false);

  const getMK = async (prodiId: string = "", dosenId: string = "") => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${prodiId}${dosenId ? `&dosen=${dosenId}` : ""}`
      );
      if (response.data.status !== 400) {
        setMK(response.data.data);
        console.log(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran`);
      if (response.data.status !== 400) {
        setTahunAjaran(response.data.data);
        setSelectedTahun(String(response.data.data[0].id));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const delMK = async (kode: string) => {
    try {
      const result = await Swal.fire({
        title: "Tunggu !..",
        text: `Kamu yakin ingin hapus data ini?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#0F172A",
      });

      if (result.isConfirmed) {
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
      }
    } catch (error) {
      throw error;
    }
  };

  let jumlahMahasiswa: number = 0;
  const renderData = () => {
    if (MK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className='text-center'>
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
          <TableCell className='w-[8%] text-center'>{mk.kode}</TableCell>
          <TableCell className='flex-1 text-center'>
            {mk.deskripsi.length > 20
              ? mk.deskripsi.slice(0, 18) + "..."
              : mk.deskripsi}
          </TableCell>
          <TableCell className='flex-1 text-center'>
            {mk.deskripsiInggris.length > 20
              ? mk.deskripsiInggris.slice(0, 18) + "..."
              : mk.deskripsiInggris}
          </TableCell>
          <TableCell className='w-[15%] text-center'>
            {mk.CPMK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {jumlahMahasiswa}
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {mk.lulusMK.find(
              (item) => item.tahunAjaranId === parseInt(selectedTahun)
            )?.jumlahLulus || 0}
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {mk.lulusMK
              .find((item) => item.tahunAjaranId === parseInt(selectedTahun))
              ?.persentaseLulus.toFixed(2) || 0}
            %
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {mk.batasLulusMK}%
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {(mk.lulusMK.find(
              (item) => item.tahunAjaranId === parseInt(selectedTahun)
            )?.persentaseLulus ?? 0) >= mk.batasLulusMK
              ? "Lulus"
              : "Tidak Lulus"}
          </TableCell>
          <TableCell className='w-[8%] flex gap-2 text-center'>
            <Button variant='destructive' onClick={() => delMK(mk.kode)}>
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

  useEffect(() => {
    if (accountData?.role === "Dosen") {
      getMK(accountData.prodiId, accountData.id);
    } else {
      getMK(accountData?.prodiId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]); // Trigger useEffect only on initial mount

  useEffect(() => {
    getTahunAjaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className='flex justify-center items-center mt-20'>
      <Card className='w-[1200px]'>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='flex flex-col'>
            <CardTitle>Tabel MK</CardTitle>
            <CardDescription>Mata Kuliah</CardDescription>
          </div>
          
          <div className='flex gap-3'>
            <Select
              onValueChange={(e) => setSelectedTahun(e)}
              value={selectedTahun}
            >
              <SelectTrigger className='w-[250px]'>
                <SelectValue placeholder='Tahun Ajaran' />
              </SelectTrigger>
              <SelectContent>
                {tahunAjaran.map((tahun) => (
                  <SelectItem key={tahun.id} value={String(tahun.id)}>
                    {tahun.tahun} {tahun.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                router.push("/dashboard/input/mk");
              }}
            >
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[8%] text-center'>Kode</TableHead>
                  <TableHead className='flex-1 text-center'>
                    Nama Matakuliah
                  </TableHead>
                  <TableHead className='flex-1 text-center'>
                    Nama Matakuliah Inggris
                  </TableHead>
                  <TableHead className='w-[15%] text-center'>CPMK</TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Jumlah Mahasiswa
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Jumlah Lulus
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Persentase Lulus
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Batas Lulus MK
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Status MK
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>Aksi</TableHead>
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
                  <TableHead className='w-[8%] text-center'>Kode</TableHead>
                  <TableHead className='flex-1 text-center'>
                    Nama Matakuliah
                  </TableHead>
                  <TableHead className='flex-1 text-center'>
                    Nama Matakuliah Inggris
                  </TableHead>
                  <TableHead className='w-[15%] text-center'>CPMK</TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Jumlah Mahasiswa
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Jumlah Lulus
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Persentase Lulus
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Batas Lulus MK
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>
                    Status MK
                  </TableHead>
                  <TableHead className='w-[8%] text-center'>Aksi</TableHead>
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
