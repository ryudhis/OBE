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
  kode: string;
  deskripsi: string;
  keterangan: string;
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
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delCPL = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/cpl/${kode}`);
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
  // id, kode, deskripsi

  const renderData = () => {
    return CPL.map((cpl, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[15%]">{cpl.kode}</TableCell>
          <TableCell className="flex-1">{cpl.deskripsi}</TableCell>
          <TableCell className="w-[15%]">{cpl.keterangan}</TableCell>
          <TableCell className="w-[15%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                delCPL(cpl.kode);
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
        <CardHeader>
          <CardTitle>Tabel CPL</CardTitle>
          <CardDescription>Capaian Pembelajaran</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[15%]">Keterangan</TableHead>
                  <TableHead className="w-[15%]">Aksi</TableHead>
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
                  <TableHead className="w-[15%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[15%]">Keterangan</TableHead>
                  <TableHead className="w-[15%]">Aksi</TableHead>
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
