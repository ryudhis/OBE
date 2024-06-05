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
            <>
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
                : Array(CPMK.kriteria.length).fill(
                    <TableCell className="w-[16%] text-center">-</TableCell>
                  )}
              <TableCell
                className={`w-[16%] text-center ${
                  statusCPMKItem?.statusLulus === "Lulus"
                    ? "bg-green-300"
                    : "bg-red-500"
                }`}
              >
                {statusCPMKItem?.statusLulus || "Tidak Lulus"}
              </TableCell>
            </>
          );
        })}
      </TableRow>
    ));
  };

  if (kelas) {
    return (
      <main className="w-screen h-full mx-auto pt-20 bg-[#FAFAFA] p-5 flex flex-col gap-12">
        <Card className="w-[1000px] mx-auto">
          <CardHeader>
            <CardTitle>Input Mahasiswa Excel</CardTitle>
            <CardDescription>Data Mahasiswa</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            {mahasiswa.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(mahasiswa[0]).map((key, index) => (
                      <TableHead key={index}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mahasiswa.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, index) => (
                        <TableCell key={index}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={onSubmit}>Submit</Button>
          </CardFooter>
        </Card>
        {kelas.mahasiswa.length != 0 ? (
          <Card className="w-[1000px] mx-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <CardTitle>Tabel Mahasiswa Kelas {kelas.nama}</CardTitle>
                <CardDescription>Kelas {kelas.MK.deskripsi}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[8%]">NIM</TableHead>
                      <TableHead className="w-[8%]">Nama</TableHead>
                      <TableHead className="w-[8%]">Total Nilai</TableHead>
                      {kelas.MK.penilaianCPMK.map((CPMK) => (
                        <TableHead
                          colSpan={CPMK.kriteria.length}
                          key={CPMK.CPMKkode}
                          className="w-[16%]"
                        >
                          {CPMK.CPMKkode}
                        </TableHead>
                      ))}
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
                      <TableHead rowSpan={2} className="w-[8%] text-center">
                        NIM
                      </TableHead>
                      <TableHead rowSpan={2} className="w-[8%] text-center">
                        Nama
                      </TableHead>
                      <TableHead rowSpan={2} className="w-[8%] text-center">
                        Total Nilai
                      </TableHead>
                      {kelas.MK.penilaianCPMK.map((CPMK) => (
                        <TableHead
                          colSpan={CPMK.kriteria.length + 1}
                          key={CPMK.CPMKkode}
                          className="w-[16%] text-center border-x-2"
                        >
                          {CPMK.CPMKkode}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow>
                      {kelas.MK.penilaianCPMK.map((PCPMK) => (
                        <>
                          {PCPMK.kriteria.map((kriteria) => (
                            <TableHead
                              key={kriteria.kriteria}
                              className="w-[16%] text-center"
                            >
                              {kriteria.kriteria} <br /> {kriteria.bobot}
                            </TableHead>
                          ))}
                          <TableHead className="w-[16%] text-center">
                            Status
                          </TableHead>
                        </>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderData()}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <h1>Tidak ada data mahasiswa.</h1>
        )}
      </main>
    );
  }
}
