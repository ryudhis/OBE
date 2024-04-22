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

export interface mk {
  kode: string;
  deskripsi: string;
  BK: BKItem[];
  CPMK: CPMKItem[];
}

export interface BKItem {
  kode: string;
}

export interface CPMKItem {
  kode: string;
}

const DataMK = () => {
  const router = useRouter();
  const [MK, setMK] = useState<mk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/mk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMK(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
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
        getMK();
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
    getMK();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return MK.map((mk, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{mk.kode}</TableCell>
          <TableCell className="flex-1">
            {mk.deskripsi.length > 20
              ? mk.deskripsi.slice(0, 18) + "..."
              : mk.deskripsi}
          </TableCell>
          <TableCell className="w-[15%]">
            {mk.BK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[15%]">
            {mk.CPMK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
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
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Nama Matakuliah</TableHead>
                  <TableHead className="w-[15%]">BK</TableHead>
                  <TableHead className="w-[15%]">CPMK</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
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
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Nama Matakuliah</TableHead>
                  <TableHead className="w-[15%]">BK</TableHead>
                  <TableHead className="w-[15%]">CPMK</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
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
