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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface penilaianCPMK {
  kode: string;
  CPL: string;
  MK: string;
  CPMK: string;
  tahapPenilaian: string;
  teknikPenilaian: string;
  instrumen: string;
  kriteria: kriteriaItem[];
  batasNilai: number;
}

export interface MKItem {
  kode: string;
  deskripsi: string;
}

export interface kriteriaItem {
  bobot: number;
  kriteria: string;
}

const DataPenilaianCPMK = () => {
  const router = useRouter();
  const [penilaianCPMK, setPenilaianCPMK] = useState<penilaianCPMK[]>([]);
  const [MK, setMK] = useState<MKItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMK, setFilterMK] = useState("default");

  let filteredPCPMK = penilaianCPMK;
  let totalBobot = 0;

  if (filterMK !== "default") {
    filteredPCPMK = penilaianCPMK.filter((pcpmk) => pcpmk.MK === filterMK);

    filteredPCPMK.map((pcpmk) => {
      pcpmk.kriteria.map((kriteria) => {
        totalBobot += kriteria.bobot;
      });
    });
  }

  const getPenilaianCPMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/penilaianCPMK");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setPenilaianCPMK(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/mk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMK(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delPenilaianCPMK = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/penilaianCPMK/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data penilaian CPMK",
          variant: "default",
        });
        getPenilaianCPMK();
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
    getPenilaianCPMK();
  }, []);

  useEffect(() => {
    getMK();
  }, []);

  const renderData = () => {
    return filteredPCPMK.map((pCPMK) => {
      return (
        <TableRow key={pCPMK.kode}>
          <TableCell className='w-[2%]'>{pCPMK.kode}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.MK}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.CPL}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.CPMK}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.tahapPenilaian}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.teknikPenilaian}</TableCell>
          <TableCell className='w-[7%]'>{pCPMK.instrumen}</TableCell>
          <TableCell>
            {pCPMK.kriteria.map((item, index) => (
              <TableRow key={index} className='flex-1'>
                {item.kriteria}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>
            {pCPMK.kriteria.map((item, index) => (
              <TableRow key={index} className='flex-1'>
                {item.bobot}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>{pCPMK.batasNilai}</TableCell>
          <TableCell className='w-[7%] flex gap-2'>
            <Button
              variant='destructive'
              onClick={() => delPenilaianCPMK(pCPMK.kode)}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/penilaianCPMK/${pCPMK.kode}/`);
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
    <section className='flex justify-center items-center mt-20 flex-col'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='flex flex-col'>
            <CardTitle>Tabel Penilaian CPMK</CardTitle>
            <CardDescription>
              Penilaian Capaian Pembelajaran Mata Kuliah
            </CardDescription>
          </div>

          <Select
            onValueChange={(value) => {
              setFilterMK(value);
            }}
            defaultValue={filterMK}
            value={filterMK}
            required
          >
            <SelectTrigger className='w-[30%]'>
              <SelectValue placeholder='Pilih MK' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Pilih MK</SelectItem>
              {MK.map((mk, index) => {
                return (
                  <SelectItem key={index} value={mk.kode}>
                    {mk.kode}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              router.push("/dashboard/input/penilaianCPMK");
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
                  <TableHead className='w-[2%]'>ID</TableHead>
                  <TableHead className='w-[7%]'>MK</TableHead>
                  <TableHead className='w-[7%]'>CPL</TableHead>
                  <TableHead className='w-[7%]'>CPMK</TableHead>
                  <TableHead className='w-[7%]'>Tahap Penilaian</TableHead>
                  <TableHead className='w-[7%]'>Teknik Penilaian</TableHead>
                  <TableHead className='w-[7%]'>Instrumen</TableHead>
                  <TableHead className='w-[20%]'>Kriteria</TableHead>
                  <TableHead className='flex-1'>Bobot</TableHead>
                  <TableHead className='flex-1'>Batas Nilai</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={10} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[2%]'>ID</TableHead>
                  <TableHead className='w-[7%]'>MK</TableHead>
                  <TableHead className='w-[7%]'>CPL</TableHead>
                  <TableHead className='w-[7%]'>CPMK</TableHead>
                  <TableHead className='w-[7%]'>Tahap Penilaian</TableHead>
                  <TableHead className='w-[7%]'>Teknik Penilaian</TableHead>
                  <TableHead className='w-[7%]'>Instrumen</TableHead>
                  <TableHead className='flex-1'>Kriteria</TableHead>
                  <TableHead className='flex-1'>Bobot</TableHead>
                  <TableHead className='flex-1'>Batas Nilai</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderData()}</TableBody>
            </Table>
          )}
        </CardContent>
        {filterMK !== "default" && (
          <p
            className={`ml-[800px] ${
              totalBobot !== 100 ? "text-red-500" : "text-green-500"
            }`}
          >
            Total Bobot : {totalBobot}
          </p>
        )}
      </Card>
    </section>
  );
};

export default DataPenilaianCPMK;
