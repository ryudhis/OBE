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

export interface mahasiswa {
  nim: string;
  nama: string;
  inputNilai: inputNilaiItem[];
}

export interface inputNilaiItem {
  nilai: number;
}

const DataMahasiswa = () => {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<mahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getMahasiswa = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/mahasiswa");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMahasiswa(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delPL = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/pl/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data PL",
          variant: "default",
        });
        getMahasiswa();
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
    getMahasiswa();
  }, []);

  const renderData = () => {
    return mahasiswa.map((mhs) => {
      return (
        <TableRow key={mhs.nim}>
          <TableCell className="w-[20%]">{mhs.nim}</TableCell>
          <TableCell className="flex-1">{mhs.nama}</TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button variant="destructive" onClick={() => delPL(mhs.nim)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/mahasiswa/${mhs.nim}/`);
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
            <CardTitle>Tabel Mahasiswa</CardTitle>
            <CardDescription>Mahasiswa</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/mahasiswa");
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
                  <TableHead className="w-[20%]">NIM</TableHead>
                  <TableHead className="flex-1">Nama</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={3} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">NIM</TableHead>
                  <TableHead className="flex-1">Nama</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
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

export default DataMahasiswa;
