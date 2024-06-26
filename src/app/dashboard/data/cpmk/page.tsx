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

export interface cpmk {
  kode: string;
  deskripsi: string;
  CPL: CPLItem[];
  MK: MKItem[];
  subCPMK: subCPMKItem[];
}

export interface CPLItem {
  kode: string;
}

export interface MKItem {
  kode: string;
}

export interface subCPMKItem {
  kode: string;
}

const DataCPMK = () => {
  const router = useRouter();
  const [CPMK, setCPMK] = useState<cpmk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getCPMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/cpmk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPMK(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delCPMK = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/cpmk/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data CPMK",
          variant: "default",
        });
        getCPMK();
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
    getCPMK();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return CPMK.map((cpmk, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{cpmk.kode}</TableCell>
          <TableCell className="flex-1">
            {cpmk.deskripsi.length > 20
              ? cpmk.deskripsi.slice(0, 18) + "..."
              : cpmk.deskripsi}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpmk.CPL.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpmk.MK.map((item) => item.kode).join(", ")}
          </TableCell>
          {/* <TableCell className="w-[12%]">{cpmk.subCPMK.map((item) => item.kode).join(", ")}</TableCell> */}
          <TableCell className="w-[8%] flex gap-2">
            <Button variant="destructive" onClick={() => delCPMK(cpmk.kode)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/cpmk/${cpmk.kode}/`);
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
            <CardTitle>Tabel CPMK</CardTitle>
            <CardDescription>Capaian Pembelajaran Mata Kuliah</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/cpmk");
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
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[12%]">CPL</TableHead>
                  <TableHead className="w-[12%]">MK</TableHead>
                  {/* <TableHead className="w-[12%]">subCPMK</TableHead> */}
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
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[12%]">CPL</TableHead>
                  <TableHead className="w-[12%]">MK</TableHead>
                  {/* <TableHead className="w-[12%]">subCPMK</TableHead> */}
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

export default DataCPMK;
