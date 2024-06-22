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

export interface cpl {
  id: number;
  kode: string;
  deskripsi: string;
  keterangan: string;
  BK: BKItem[];
  PL: PLItem[];
  CPMK: CPMKItem[];
}

export interface BKItem {
  kode: string;
}

export interface PLItem {
  kode: string;
}

export interface CPMKItem {
  kode: string;
}

const DataCPL = () => {
  const router = useRouter();
  const [CPL, setCPL] = useState<cpl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getCPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/cpl");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPL(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delCPL = async (id: number) => {
    try {
      const response = await axiosConfig.delete(`api/cpl/${id}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data CPL",
          variant: "default",
        });
        getCPL();
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
    getCPL();
  }, []);

  const renderData = () => {
    return CPL.map((cpl, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{cpl.kode}</TableCell>
          <TableCell className="flex-1">
            {cpl.deskripsi.length > 16
              ? cpl.deskripsi.slice(0, 14) + "..."
              : cpl.deskripsi}
          </TableCell>
          <TableCell className="w-[8%]">{cpl.keterangan}</TableCell>
          <TableCell className="w-[12%]">
            {cpl.BK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpl.PL.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpl.CPMK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                delCPL(cpl.id);
              }}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/cpl/${cpl.kode}/`);
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
            <CardTitle>Tabel CPL</CardTitle>
            <CardDescription>Capaian Pembelajaran</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/cpl");
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
                  <TableHead className="w-[8%]">Keterangan</TableHead>
                  <TableHead className="w-[12%]">BK</TableHead>
                  <TableHead className="w-[12%]">PL</TableHead>
                  <TableHead className="w-[12%]">CPMK</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={7} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[8%]">Keterangan</TableHead>
                  <TableHead className="w-[12%]">BK</TableHead>
                  <TableHead className="w-[12%]">PL</TableHead>
                  <TableHead className="w-[12%]">CPMK</TableHead>
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

export default DataCPL;
