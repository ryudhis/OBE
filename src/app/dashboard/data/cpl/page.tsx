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
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";

export interface cpl {
  id: number;
  kode: string;
  deskripsi: string;
  deskripsiInggris: string;
  keterangan: string;
  BK: BKItem[];
  PL: PLItem[];
  CPMK: CPMKItem[];
  performaCPL: performaCPLItem[];
}

export interface performaCPLItem {
  id: number;
  CPLId: number;
  tahunAjaranId: number;
  performa: number;
  tahunAjaran: tahunAjaran[];
}

export interface tahunAjaran {
  id: string;
  tahun: string;
  semester: string;
}

export interface BKItem {
  kode: string;
}

export interface PLItem {
  kode: string;
}

export interface CPMKItem {
  kode: string;
}

const DataCPL = () => {
  const router = useRouter();
  const [CPL, setCPL] = useState<cpl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("default");
  const { accountData } = useAccount();
  const [semester, setSemester] = useState<tahunAjaran[]>([]);

  const getCPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/cpl?prodi=${accountData?.prodiId}`
      );
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPL(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran`);
      if (response.data.status !== 400) {
        setSemester(response.data.data);
        setFilterTahunAjaran(response.data.data[0].id);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const delCPL = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: "Tunggu !..",
        text: `Kamu yakin ingin hapus data ini?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#0F172A",
      });

      if (result.isConfirmed) {
        const response = await axiosConfig.delete(`api/cpl/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data CPL",
            variant: "default",
          });
          setRefresh(!refresh);
        } else {
          toast({
            title: response.data.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getCPL();
  }, [refresh]); // Trigger useEffect only on initial mount

  useEffect(() => {
    if (accountData) {
      getTahunAjaran();
    }
  }, []);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page data CPL.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (CPL.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center">
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    return CPL.map((cpl, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{cpl.kode}</TableCell>
          <TableCell className="flex-1">
            {cpl.deskripsi.length > 16
              ? cpl.deskripsi.slice(0, 14) + "..."
              : cpl.deskripsi}
          </TableCell>
          <TableCell className="flex-1">
            {cpl.deskripsiInggris.length > 16
              ? cpl.deskripsiInggris.slice(0, 14) + "..."
              : cpl.deskripsiInggris}
          </TableCell>
          <TableCell className="w-[8%]">{cpl.keterangan}</TableCell>
          <TableCell className="w-[12%]">
            {cpl.BK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpl.PL.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpl.CPMK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpl.performaCPL
              .find(
                (item) => item.tahunAjaranId === parseInt(filterTahunAjaran)
              )
              ?.performa.toFixed(2)}
            {cpl.performaCPL.length > 0 ? "%" : "-"}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                delCPL(cpl.id);
              }}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/cpl/${cpl.id}/`);
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
            <CardTitle>Tabel CPL</CardTitle>
            <CardDescription>Capaian Pembelajaran</CardDescription>
          </div>
          <Select
            onValueChange={(e) => {
              setFilterTahunAjaran(e);
            }}
            value={filterTahunAjaran}
            required
          >
            <SelectTrigger className="w-[30%]">
              <SelectValue placeholder="Pilih Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {semester.map((semester, index) => {
                return (
                  <SelectItem key={index} value={semester.id}>
                    {semester.tahun} {semester.semester}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              router.push("/dashboard/input/cpl");
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
                  <TableHead className="flex-1">Deskripsi Inggris</TableHead>
                  <TableHead className="w-[8%]">Keterangan</TableHead>
                  <TableHead className="w-[12%]">BK</TableHead>
                  <TableHead className="w-[12%]">PL</TableHead>
                  <TableHead className="w-[12%]">CPMK</TableHead>
                  <TableHead className="w-[12%]">Performa</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={9} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="flex-1">Deskripsi Inggris</TableHead>
                  <TableHead className="w-[8%]">Keterangan</TableHead>
                  <TableHead className="w-[12%]">BK</TableHead>
                  <TableHead className="w-[12%]">PL</TableHead>
                  <TableHead className="w-[12%]">CPMK</TableHead>
                  <TableHead className="w-[12%]">Performa</TableHead>
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

export default DataCPL;
