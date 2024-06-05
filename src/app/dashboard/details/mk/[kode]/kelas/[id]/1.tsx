"use client";
import axiosConfig from "@utils/axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SkeletonTable from "@/components/SkeletonTable";
import { Input } from "@/components/ui/input";

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
  CardFooter,
} from "@/components/ui/card";

export interface MKinterface {
  kode: string;
  deskripsi: string;
  sks: string;
  batasLulusMahasiswa: number;
  BK: BKItem[];
  CPMK: CPMKItem[];
  kelas: KelasItem[];
  penilaianCPMK: penilaianCPMKItem[];
}

export interface KelasItem {
  id: number;
  nama: string;
  mahasiswa: mahasiswaItem[];
  jumlahLulus: number;
  mahasiswaLulus: mahasiswaLulusItem[];
  MK: MKinterface;
}

export interface mahasiswaLulusItem {
  nim: string;
  totalNilai: number;
  statusLulus: string;
  statusCPMK: statusCPMKItem[];
  nilaiMahasiswa: nilaiMahasiswaItem[];
}

export interface nilaiMahasiswaItem {
  nilai: number[];
  namaCPMK: string;
  batasNilai: number;
}

export interface statusCPMKItem {
  namaCPMK: string;
  nilaiCPMK: number;
  statusLulus: string;
}

export interface CPMKItem {
  kode: string;
  deskripsi: string;
}

export interface BKItem {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
  kelas: KelasItem[];
  inputNilai: inputNilaiItem[];
}

export interface inputNilaiItem {
  id: number;
  penilaianCPMK: penilaianCPMKItem[];
  mahasiswaNim: string;
  nilai: number[];
  kelasId: number;
}

export interface penilaianCPMKItem {
  kode: string;
  inputNilai: inputNilaiItem[];
  kriteria: kriteriaItem[];
  CPMK: CPMKItem;
  CPMKkode: string;
  batasNilai: number;
}

export interface kriteriaItem {
  kriteria: string;
  bobot: number;
}

export interface mahasiswaExcel {
  nim: string;
  nama: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [kelas, setKelas] = useState<KelasItem | undefined>();
  const [dataMahasiswaLulus, setDataMahasiswaLulus] = useState<
    mahasiswaLulusItem[]
  >([]);
  const [mahasiswa, setMahasiswa] = useState<mahasiswaExcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsBinaryString(e.target.files[0]);
    }
    reader.onload = (e) => {
      const dataWorkbook = e.target?.result;
      const workbook = XLSX.read(dataWorkbook, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let parsedData: mahasiswaExcel[] = XLSX.utils.sheet_to_json(sheet);

      // Filter parsedData to only include Nama and NIM data
      parsedData = parsedData.map((item: any) => ({
        nim: item.nim,
        nama: item.nama,
      }));
      setMahasiswa(parsedData);
    };
  };

  function onSubmit(e: any) {
    e.preventDefault();

    const data = {
      mahasiswa: mahasiswa,
      kelasId: id,
    };

    axiosConfig
      .patch(`api/kelas/relasi/${id}`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Kode Sudah Ada!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Submit",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  }

  const getKelas = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(`api/kelas/${id}`);

      if (response.data.status !== 400) {
        const kelasData = response.data.data;
        const mahasiswaLulusData: mahasiswaLulusItem[] = [];

        kelasData.mahasiswa.forEach((mahasiswa: mahasiswaItem) => {
          mahasiswa.kelas.forEach((kelasMahasiswa: KelasItem) => {
            if (kelasMahasiswa.id === kelasData.id) {
              kelasMahasiswa.mahasiswaLulus.forEach(
                (mahasiswaLulus: mahasiswaLulusItem) => {
                  if (mahasiswaLulus.nim === mahasiswa.nim) {
                    mahasiswaLulusData.push(mahasiswaLulus);
                  }
                }
              );
            }
          });
        });
        console.log(mahasiswaLulusData);
        setDataMahasiswaLulus(mahasiswaLulusData);
        setKelas(kelasData);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getKelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const renderData = () => {
    return dataMahasiswaLulus.map((lulusData) => (
      <TableRow key={lulusData.nim}>
        <TableCell className="w-[8%]">{lulusData.nim}</TableCell>
        <TableCell className="w-[8%]">
          {kelas?.mahasiswa.find((m) => m.nim === lulusData.nim)?.nama || "-"}
        </TableCell>
        <TableCell
          className={`w-[8%] ${
            lulusData.statusLulus === "Lulus" ? "bg-green-300" : "bg-red-500"
          }`}
        >
          {lulusData.totalNilai}
        </TableCell>
        {kelas?.MK.penilaianCPMK.map((CPMK) => {
          const nilaiMahasiswaItem = lulusData.nilaiMahasiswa.find(
            (item) => item.namaCPMK === CPMK.CPMKkode
          );
          const statusCPMKItem = lulusData.statusCPMK.find(
            (item) => item.namaCPMK === CPMK.CPMKkode
          );

          return (
            <React.Fragment key={CPMK.CPMKkode}>
              {nilaiMahasiswaItem
                ? nilaiMahasiswaItem.nilai.map((nilai, index) => {
                    const isNilaiValid = nilai >= nilaiMahasiswaItem.batasNilai;
                    const cellClassName = isNilaiValid
                      ? "bg-green-300"
                      : "bg-red-500";
                    return (
                      <TableCell
                        key={index}
                        className={`w-[16%] text-center ${cellClassName}`}
                      >
                        {nilai}
                      </TableCell>
                    );
                  })
                : Array.from({ length: CPMK.kriteria.length }, (_, i) => (
                    <TableCell key={i} className="w-[16%] text-center">
                      -
                    </TableCell>
                  ))}
              <TableCell
                key={`status-${CPMK.CPMKkode}`}
                className={`w-[16%] text-center ${
                  statusCPMKItem?.statusLulus === "Lulus"
                    ? "bg-green-300"
                    : "bg-red-500"
                }`}
              >
                {statusCPMKItem?.statusLulus || "Tidak Lulus"}
              </TableCell>
            </React.Fragment>
          );
        })}
      </TableRow>
    ));
  };

  if (kelas) {
    return (
      <main className="w-screen h-full mx-auto pt-20 bg-[#FAFAFA] p-5 flex flex-col gap-12">
        <Card className="shadow-sm border border-slate-200 rounded-md">
          <CardHeader>
            <CardTitle className="text-2xl">Data Mahasiswa</CardTitle>
            <CardDescription>
              Masukkan data mahasiswa dengan format file .xlsx
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={onSubmit}
              className="w-full flex gap-4 items-center justify-center"
            >
              <Input
                required
                id="inputFile"
                type="file"
                onChange={handleFileUpload}
                className="border p-2"
              />
              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-slate-200 rounded-md">
          <CardHeader>
            <CardTitle className="text-2xl">Data Mahasiswa Lulus</CardTitle>
            <CardDescription>Berikut data mahasiswa yang lulus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[8%]">NIM</TableHead>
                    <TableHead className="w-[8%]">Nama</TableHead>
                    <TableHead className="w-[8%]">Total Nilai</TableHead>
                    {kelas.MK.penilaianCPMK.map((CPMK) => (
                      <React.Fragment key={CPMK.CPMKkode}>
                        {CPMK.kriteria.map((kriteria, index) => (
                          <TableHead
                            className="text-center w-[16%]"
                            key={index}
                          >
                            {kriteria.kriteria}
                          </TableHead>
                        ))}
                        <TableHead
                          className="text-center w-[16%]"
                          key={`status-${CPMK.CPMKkode}`}
                        >
                          Status CPMK ({CPMK.CPMKkode})
                        </TableHead>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>{renderData()}</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }
}
