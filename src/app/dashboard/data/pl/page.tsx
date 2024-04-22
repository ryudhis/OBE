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

export interface pl {
  kode: string;
  deskripsi: string;
  CPL: CPLItem[];
}

export interface CPLItem {
  kode: string;
}

const DataPL = () => {
  const router = useRouter();
  const [PL, setPL] = useState<pl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/pl");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setPL(response.data.data);
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
        getPL();
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
    getPL();
  }, []);

  const renderData = () => {
    return PL.map((pl, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[10%]">{pl.kode}</TableCell>
          <TableCell className="flex-1">
            {pl.deskripsi.length > 20
              ? pl.deskripsi.slice(0, 18) + "..."
              : pl.deskripsi}
          </TableCell>
          <TableCell className="w-[20%]">
            {pl.CPL.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button variant="destructive" onClick={() => delPL(pl.kode)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/pl/${pl.kode}/`);
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
            <CardTitle>Tabel PL</CardTitle>
            <CardDescription>Profil Lulusan</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/pl");
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
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[20%]">CPL</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
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
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[20%]">CPL</TableHead>
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

export default DataPL;
