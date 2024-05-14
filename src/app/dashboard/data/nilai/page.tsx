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
import { penilaianCPMK } from "@prisma/client";

export interface inputNilai {
  id: number;
  penilaianCPMKId: string;
  mahasiswaNim: string;
  nilai: number[];
  penilaianCPMK: penilaianCPMKItem;
}

export interface penilaianCPMKItem {
  kriteria: kriteriaItem[];
}

export interface kriteriaItem {
  bobot: number;
  kriteria: string;
}

const DataNilai = () => {
  const router = useRouter();
  const [inputNilai, setInputNilai] = useState<inputNilai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getInputNilai = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/inputNilai");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setInputNilai(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delInputNilai = async (id: number) => {
    try {
      const response = await axiosConfig.delete(`api/inputNilai/${id}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data inputNilai",
          variant: "default",
        });
        getInputNilai();
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
    getInputNilai();
  }, []);

  const renderData = () => {
    return inputNilai.map((nilai) => {
      return (
        <TableRow key={nilai.id}>
          <TableCell className="w-[10%]">{nilai.penilaianCPMKId}</TableCell>
          <TableCell className="flex-1">{nilai.mahasiswaNim}</TableCell>
          <TableCell>
            {nilai.nilai.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {item}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>
            {nilai.nilai.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {item * (nilai.penilaianCPMK.kriteria[index].bobot * 0.01)}
              </TableRow>
            ))}
          </TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => delInputNilai(nilai.id)}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/inputNilai/${nilai.id}/`);
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
    <section className="flex justify-center items-center my-20">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel Nilai Mahasiswa</CardTitle>
            <CardDescription>Nilai Mahasiswa</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/nilai");
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
                  <TableHead className="w-[10%]">PCPMK ID</TableHead>
                  <TableHead className="flex-1">NIM</TableHead>
                  <TableHead className="w-[10%]">Nilai Asli</TableHead>
                  <TableHead className="w-[10%]">Nilai Pembobotan</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={5} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">PCPMK ID</TableHead>
                  <TableHead className="flex-1">NIM</TableHead>
                  <TableHead className="w-[10%]">Nilai Asli</TableHead>
                  <TableHead className="w-[10%]">Nilai Pembobotan</TableHead>
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

export default DataNilai;
