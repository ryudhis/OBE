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
  CPL: CPLItem[];
  MK: MKItem[];
}

export interface MKItem {
  kode: string;
}

export interface CPLItem {
  kode: string;
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
          <TableCell className="w-[8%]">{bk.kode}</TableCell>
          <TableCell className="flex-1">
            {bk.deskripsi.length > 20
              ? bk.deskripsi.slice(0, 18) + "..."
              : bk.deskripsi}
          </TableCell>
          <TableCell className="w-[4%]">{bk.min}</TableCell>
          <TableCell className="w-[4%]">{bk.max}</TableCell>
          <TableCell className="w-[18%]">
            {bk.CPL.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[18%]">
            {bk.MK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
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
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel BK</CardTitle>
            <CardDescription>Bahan Kajian</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/bk");
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
                  <TableHead className="w-[4%]">Min</TableHead>
                  <TableHead className="w-[4%]">Max</TableHead>
                  <TableHead className="w-[18%]">CPL</TableHead>
                  <TableHead className="w-[18%]">MK</TableHead>
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
                  <TableHead className="w-[4%]">Min</TableHead>
                  <TableHead className="w-[4%]">Max</TableHead>
                  <TableHead className="w-[18%]">CPL</TableHead>
                  <TableHead className="w-[18%]">MK</TableHead>
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

export default DataBK;
