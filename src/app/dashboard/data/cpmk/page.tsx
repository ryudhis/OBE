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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface cpmk {
  kode: string;
  deskripsi: string;
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
  useEffect(() => {
    getCPMK();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return CPMK.map((cpmk, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{cpmk.kode}</TableCell>
          <TableCell>{cpmk.deskripsi}</TableCell>
          <Button
            onClick={() => {
              router.push(`/dashboard/details/cpmk/${cpmk.kode}/`);
            }}
          >
            Details
          </Button>
        </TableRow>
      );
    });
  };

  return (
    <section className="flex justify-center items-center mt-20">
      <Card className="w-[1000px]">
        <CardHeader>
          <CardTitle>Tabel CPMK</CardTitle>
          <CardDescription>Capaian Pembelajaran Mata Kuliah</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Deskripsi</TableHead>
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
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Deskripsi</TableHead>
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
