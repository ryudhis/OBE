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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";

export interface prodi {
  kode: string;
  nama: string;
}

const DataProdi = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [prodi, setProdi] = useState<prodi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const getProdi = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(`api/prodi?`);
      if (response.data.status !== 400) {
        setProdi(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const delProdi = async (kode: string) => {
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
        const response = await axiosConfig.delete(`api/prodi/${kode}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data PL",
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

  useEffect(() => {
    getProdi();
  }, [refresh]); // Trigger useEffect only on initial mount

  if (accountData?.role !== "Super Admin") {
    toast({
      title: "Anda tidak memiliki akses untuk page data Prodi.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    return prodi.map((prodi, index) => {
      return (
        <TableRow key={index}>
          <TableCell className='w-[10%]'>{prodi.kode}</TableCell>
          <TableCell className='flex-1'>
            {prodi.nama.length > 20
              ? prodi.nama.slice(0, 18) + "..."
              : prodi.nama}
          </TableCell>
          <TableCell className='w-[10%]'>
            <Button variant='destructive' onClick={() => delProdi(prodi.kode)}>
              Hapus
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <section className='flex justify-center items-center mt-20'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='flex flex-col'>
            <CardTitle>Tabel Prodi</CardTitle>
            <CardDescription>Program Studi</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/prodi");
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
                  <TableHead className='w-[10%]'>Kode</TableHead>
                  <TableHead className='flex-1'>Nama</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={4} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[10%]'>Kode</TableHead>
                  <TableHead className='flex-1'>Nama</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
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

export default DataProdi;
