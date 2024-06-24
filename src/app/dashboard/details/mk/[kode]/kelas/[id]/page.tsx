"use client";
import axiosConfig from "@utils/axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SkeletonTable from "@/components/SkeletonTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  dataCPMK: dataCPMKItem[];
  MK: MKinterface;
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

export interface mahasiswaLulusItem {
  nim: string;
  totalNilai: number;
  statusLulus: string;
  statusCPMK: statusCPMKItem[];
  nilaiMahasiswa: nilaiMahasiswaItem[];
  indexNilai: string;
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
  NIM: string;
  Nama: string;
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
        Nama: item.Nama,
        NIM: item.NIM,
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

  const renderDataNilai = () => {
    return dataMahasiswaLulus.map((lulusData, index) => (
      <TableRow key={lulusData.nim}>
        <TableCell className="w-[8%]">{index + 1}</TableCell>
        <TableCell className="w-[8%]">{lulusData.nim}</TableCell>
        <TableCell className="w-[8%]">
          {kelas?.mahasiswa.find((m) => m.nim === lulusData.nim)?.nama || "-"}
        </TableCell>
        <TableCell
          className={`w-[8%] ${
            lulusData.statusLulus === "Lulus" ? "bg-green-300" : "bg-red-300"
          }`}
        >
          {lulusData.totalNilai}
        </TableCell>
        <TableCell
          className={`w-[8%] ${
            lulusData.indexNilai <= "C" ? "bg-green-300" : "bg-red-300"
          }`}
        >
          {lulusData.indexNilai}
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
                      : "bg-red-300";
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
                    : "bg-red-300"
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

  const renderDataRangkuman = () => {
    return kelas?.dataCPMK.map((data) => {
      return (
        <TableRow key={data.cpmk}>
          <TableCell className="w-[8%]">{data.cpmk}</TableCell>
          <TableCell className="w-[8%]">{data.cpl}</TableCell>
          <TableCell className="w-[8%]">{data.nilaiMinimal}/100</TableCell>
          <TableCell className="w-[8%]">
            {data.nilaiMasuk}/{kelas.mahasiswa.length}
          </TableCell>
          <TableCell className="w-[8%]">
            {data.jumlahLulus}/{kelas.mahasiswa.length}
          </TableCell>
          <TableCell className="w-[8%]">{data.persenLulus}%</TableCell>
          <TableCell className="w-[8%]">{data.rataNilai}</TableCell>
        </TableRow>
      );
    });
  };

  if (kelas) {
    return (
      <main className="w-screen mx-auto pt-20 p-5 flex flex-col gap-12">
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
          <Card className="w-[1200px] mx-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <CardTitle>Tabel Mahasiswa Kelas {kelas.nama}</CardTitle>
                <CardDescription>Kelas {kelas.MK.deskripsi}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="nilai" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="nilai">Nilai Mahasiswa</TabsTrigger>
                  <TabsTrigger value="rangkuman">
                    Rangkuman Evaluasi CPMK
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="nilai">
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
                            No
                          </TableHead>
                          <TableHead rowSpan={2} className="w-[8%] text-center">
                            NIM
                          </TableHead>
                          <TableHead rowSpan={2} className="w-[8%] text-center">
                            Nama
                          </TableHead>
                          <TableHead rowSpan={2} className="w-[8%] text-center">
                            Total Nilai
                          </TableHead>
                          <TableHead rowSpan={2} className="w-[8%] text-center">
                            Indeks Nilai
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
                          {kelas.MK.penilaianCPMK.map((CPMK) => (
                            <React.Fragment key={CPMK.CPMKkode}>
                              {CPMK.kriteria.map((kriteria, index) => (
                                <TableHead
                                  className="text-center w-[16%]"
                                  key={index}
                                >
                                  {kriteria.kriteria} <br />{" "}
                                  <span className="font-semibold text-blue-600">
                                    {kriteria.bobot}
                                  </span>
                                </TableHead>
                              ))}
                              <TableHead
                                className="text-center w-[16%]"
                                key={`status-${CPMK.CPMKkode}`}
                              >
                                Status
                              </TableHead>
                            </React.Fragment>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>{renderDataNilai()}</TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="rangkuman">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[8%]">CPMK </TableHead>
                        <TableHead className="w-[8%]">CPL</TableHead>
                        <TableHead className="w-[8%]">
                          Total Nilai Minimal
                        </TableHead>
                        <TableHead className="w-[8%]">Nilai Masuk</TableHead>
                        <TableHead className="w-[8%]">Jumlah Lulus</TableHead>
                        <TableHead className="w-[8%]">
                          Persen Mencapai Nilai Minimal
                        </TableHead>
                        <TableHead className="w-[8%]">Rata-Rata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderDataRangkuman()}</TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <h1 className="self-center">Belum ada data mahasiswa.</h1>
        )}
      </main>
    );
  }
}
