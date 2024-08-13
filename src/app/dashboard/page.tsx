"use client";

import React, { useState, useEffect } from "react";
import axiosConfig from "@utils/axios";
import { useAccount } from "@/app/contexts/AccountContext";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export interface CPLItem {
  id: number;
  kode: string;
  deskripsi: string;
  deskripsiInggris: string;
  keterangan: string;
  CPMK: CPMKItem[];
  performaCPL: performaCPLItem[];
}

export interface CPMKItem {
  id: number;
  kode: string;
  CPLId: number;
  lulusCPMK: lulusCPMKItem[];
  lulusMK_CPMK: lulusMK_CPMKItem[];
}

export interface performaCPLItem {
  id: number;
  CPLId: number;
  tahunAjaranId: number;
  performa: number;
  tahunAjaran: tahunAjaranItem[];
}

export interface tahunAjaranItem {
  id: string;
  tahun: string;
  semester: string;
}

export interface lulusCPMKItem {
  id: number;
  CPMKId: number;
  tahunAjaranId: number;
  jumlahLulus: number;
}

export interface lulusMK_CPMKItem {
  id: number;
  MKId: number;
  CPMKId: number;
  tahunAjaranId: number;
  jumlahLulus: number;
}

const Page = () => {
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [MK, setMK] = useState<MKinterface[]>([]);
  const [CPL, setCPL] = useState<CPLItem[]>([]);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("default");
  const [semester, setSemester] = useState<tahunAjaranItem[]>([]);

  const getMK = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/mk?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setMK(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCPL = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/cpl?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setCPL(response.data.data);
        const uniqueSemesters = new Set<string>();
        const filteredSemesters = response.data.data
          .flatMap((cpl: CPLItem) =>
            cpl.performaCPL.map((tahunAjaran) => tahunAjaran.tahunAjaran)
          )
          .filter((tahunAjaran: tahunAjaranItem) => {
            if (!uniqueSemesters.has(tahunAjaran.id)) {
              uniqueSemesters.add(tahunAjaran.id);
              return true;
            }
            return false;
          });
        setSemester(filteredSemesters);
        setFilterTahunAjaran(filteredSemesters[0].id);
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

  useEffect(() => {
    if (accountData) {
      getCPL(accountData.prodiId);
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

  const renderRangkumanPerforma = () => {
    return CPL.flatMap((cplItem) => {
      // Generate rows for each CPMK
      const CPMKRows = cplItem.CPMK.map((CPMK) => {
        // Generate MK content with commas separated
        const MKContent = CPMK.lulusMK_CPMK.map(
          (lulusMK_CPMK, index, array) => {
            const lulusMK_CPMKValue = lulusMK_CPMK.jumlahLulus.toFixed(2);
            const textColorClass =
              Number(lulusMK_CPMKValue) < 65 || !lulusMK_CPMKValue
                ? "text-red-500"
                : "";

            return (
              <React.Fragment key={lulusMK_CPMK.id}>
                <span className={textColorClass}>
                  {`${lulusMK_CPMK.MKId} (${lulusMK_CPMKValue ? lulusMK_CPMKValue : 0}%)`}
                </span>
                {index < array.length - 1 && ", "}
              </React.Fragment>
            );
          }
        );

        const lulusCPMKValue = CPMK.lulusCPMK[0]?.jumlahLulus.toFixed(2);
        const textColorClass =
          Number(lulusCPMKValue) < 65 || !lulusCPMKValue ? "text-red-500" : "";

        return (
          <TableRow key={CPMK.id}>
            <TableCell></TableCell> {/* Empty cell for CPL row */}
            <TableCell className={textColorClass}>
              {`${CPMK.kode} (${lulusCPMKValue ? lulusCPMKValue : 0}%)`}
            </TableCell>
            <TableCell>{MKContent}</TableCell>
          </TableRow>
        );
      });

      // Combine CPL row with its corresponding CPMK rows
      return [
        <TableRow key={`cpl-${cplItem.id}`}>
          <TableCell rowSpan={cplItem.CPMK.length + 1}>
            {cplItem.kode}
          </TableCell>
        </TableRow>,
        ...CPMKRows,
      ];
    });
  };

  return (
    <main className="py-12 flex flex-col gap-4 justify-center items-center">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Image
            src="/Logo2.png"
            alt="loading"
            width={100}
            height={100}
            className="animate-pulse"
          />
        </div>
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
          <Card className="w-[1200px]">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <CardTitle>Rangkuman Performa CPL</CardTitle>
              </div>
              <div className="flex flex-col">
                <Select
                  defaultValue={filterTahunAjaran}
                  onValueChange={(value) => setFilterTahunAjaran(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {semester.map((tahun) => (
                      <SelectItem key={tahun.id} value={tahun.id}>
                        {tahun.tahun}-{tahun.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex-1">CPL</TableHead>
                    <TableHead className="flex-1"></TableHead>
                    <TableHead className="flex-1">CPMK</TableHead>
                    <TableHead className="flex-1">MK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderRangkumanPerforma()}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
};

export default Page;
