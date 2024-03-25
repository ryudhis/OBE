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
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export interface bk {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

const DataBK = () => {
  const router = useRouter();
  const [BK, setBK] = useState<bk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getBK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/bk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const delBK = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/bk/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data BK",
          variant: "default",
        });
        getBK();
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
    getBK();
  }, []);

  const renderData = () => {
    return BK.map((bk, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[10%]">{bk.kode}</TableCell>
          <TableCell className="flex-1">{bk.deskripsi}</TableCell>
          <TableCell className="w-[10%]">{bk.min}</TableCell>
          <TableCell className="w-[10%]">{bk.max}</TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button variant="destructive" onClick={() => delBK(bk.kode)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/bk/${bk.kode}/`);
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
          <CardTitle>Tabel BK</CardTitle>
          <CardDescription>Bahan Kajian</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[10%]">Min</TableHead>
                  <TableHead className="w-[10%]">Max</TableHead>
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
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[10%]">Min</TableHead>
                  <TableHead className="w-[10%]">Max</TableHead>
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

export default DataBK;
