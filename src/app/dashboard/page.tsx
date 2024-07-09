"use client";

import React, { useState, useEffect } from "react";
import axiosConfig from "@utils/axios";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
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

export interface MKinterface {
  kode: string;
  deskripsi: string;
  sks: string;
  batasLulusMahasiswa: number;
  kelas: KelasItem[];
}

export interface KelasItem {
  id: number;
  nama: string;
  jumlahLulus: number;
  dataCPMK: dataCPMKItem[];
  MK: MKinterface;
  dosen: dosenItem[];
  mahasiswa: mahasiswaItem[];
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
  kelas: KelasItem[];
}

export interface dosenItem {
  id: number;
  nama: string;
}

export interface dataCPMKItem {
  cpmk: string;
  cpl: string;
  nilaiMinimal: number;
  nilaiMasuk: number;
  jumlahLulus: number;
  persenLulus: number;
  rataNilai: number;
}

const Page = () => {
  const router = useRouter();
  const accountData = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [MK, setMK] = useState<MKinterface[]>([]);

  const getMK = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/mk?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setMK(response.data.data);
        console.log(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountData) {
      getMK(accountData.prodiId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDataRangkuman = () => {
    return MK.map((item) => {
      return item.kelas?.map((kelas) => {
        return kelas.dataCPMK?.map((data) => {
          return (
            <TableRow key={data?.cpmk}>
              <TableCell>{item?.kode}</TableCell>
              <TableCell>{kelas?.nama}</TableCell>
              <TableCell>{data?.cpmk}</TableCell>
              <TableCell>{data?.cpl}</TableCell>
              <TableCell>{data?.nilaiMinimal}</TableCell>
              <TableCell>
                {data?.nilaiMasuk}/{kelas.mahasiswa.length}
              </TableCell>
              <TableCell>
                {data?.jumlahLulus}/{kelas.mahasiswa.length}
              </TableCell>
              <TableCell>{data?.persenLulus}</TableCell>
              <TableCell>{data?.rataNilai}</TableCell>
            </TableRow>
          );
        });
      });
    });
  };

  return (
    <main className="mt-4 flex flex-col gap-2 justify-center items-center">
      {isLoading ? (
        <h1 className="animate-pulse">Loading...</h1>
      ) : accountData?.role === "Super Admin" ? (
        <h1>Dashboard Super Admin</h1>
      ) : accountData?.role === "Admin Prodi" ? (
        <h1>Dashboard Admin Prodi</h1>
      ) : accountData?.role === "Kaprodi" ? (
        <>
          <Card className="w-[1200px] mx-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <CardTitle>Tabel Rangkuman Evaluasi </CardTitle>
                <CardDescription>{`Program Studi ${accountData.prodiId}`}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[8%]">MK </TableHead>
                    <TableHead className="w-[8%]">Kelas </TableHead>
                    <TableHead className="w-[8%]">CPMK </TableHead>
                    <TableHead className="w-[8%]">CPL</TableHead>
                    <TableHead className="w-[8%]">
                      Total Nilai Minimal
                    </TableHead>
                    <TableHead className="w-[8%]">Nilai Masuk</TableHead>
                    <TableHead className="w-[8%]">Jumlah Lulus</TableHead>
                    <TableHead className="w-[16%]">
                      Persen Mencapai Nilai Minimal
                    </TableHead>
                    <TableHead className="w-[8%]">Rata-Rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderDataRangkuman()}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <h1>Dashboard Dosen</h1>
      )}
    </main>
  );
};

export default Page;
