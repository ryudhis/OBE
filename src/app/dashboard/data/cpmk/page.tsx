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

const DataCPMK = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [CPMK, setCPMK] = useState<CPMK[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [semester, setSemester] = useState<TahunAjaran[]>([]);

  const getCPMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/cpmk?prodi=${accountData?.prodiId}`
      );
      if (response.data.status !== 400) {
        setCPMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
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

  const delCPMK = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/cpmk/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data CPMK",
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
    getCPMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]); // Trigger useEffect only on initial mount

  useEffect(() => {
    if (accountData) {
      getTahunAjaran();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page data CPMK.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (CPMK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center font-semibold">
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    return CPMK.map((cpmk, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{cpmk.kode}</TableCell>
          <TableCell className="flex-1">
            {cpmk.deskripsi.length > 20
              ? cpmk.deskripsi.slice(0, 18) + "..."
              : cpmk.deskripsi}
          </TableCell>
          <TableCell className="w-[12%]">{cpmk.CPL.kode}</TableCell>
          <TableCell className="w-[12%]">
            {cpmk.MK.map((item) => item.kode).join(", ")}
          </TableCell>
          <TableCell className="w-[12%]">
            {cpmk.lulusCPMK
              .find(
                (item) => item.tahunAjaranId === parseInt(filterTahunAjaran)
              )
              ?.jumlahLulus.toFixed(2)}
            {cpmk.lulusCPMK.length > 0 ? "%" : "-"}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button variant="destructive" onClick={() => delCPMK(cpmk.id)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/cpmk/${cpmk.id}/`);
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
            <CardTitle>Tabel CPMK</CardTitle>
            <CardDescription>Capaian Pembelajaran Mata Kuliah</CardDescription>
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
                  <SelectItem key={index} value={String(semester.id)}>
                    {semester.tahun} {semester.semester}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              router.push("/dashboard/input/cpmk");
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
                  <TableHead className="w-[12%]">CPL</TableHead>
                  <TableHead className="w-[12%]">MK</TableHead>
                  <TableHead className="w-[12%]">Performa</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={6} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[12%]">CPL</TableHead>
                  <TableHead className="w-[12%]">MK</TableHead>
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

export default DataCPMK;
