/* eslint-disable react-hooks/exhaustive-deps */
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
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { SearchInput } from "@/components/Search";

const DataTahun = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [tahun, setTahun] = useState<TahunAjaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const getTahun = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/tahun-ajaran?page=${currentPage}`
      );
      if (response.data.status !== 400) {
        setTahun(response.data.data);
        setMeta({
          totalItems: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages,
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const delTahun = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/tahun-ajaran/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data Tahun Ajaran",
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    getTahun();
  }, [refresh, currentPage, searchQuery]); // Trigger useEffect only on initial mount

  if (accountData?.role !== "Super Admin") {
    toast({
      title: "Anda tidak memiliki akses untuk page data Tahun.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (tahun.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return tahun.map((tahun, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[10%]">{index + 1}</TableCell>
          <TableCell className="w-[10%]">{tahun.tahun}</TableCell>
          <TableCell className="flex-1">{tahun.semester}</TableCell>
          <TableCell className="w-[10%]">
            <Button variant="destructive" onClick={() => delTahun(tahun.id)}>
              Hapus
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <section className="flex justify-center items-center mt-20 mb-10">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel Tahun Ajaran</CardTitle>
            <CardDescription>Semester Ganjil/Genap</CardDescription>
          </div>
          <div className="flex gap-5 items-center">
            <SearchInput onSearch={handleSearch} />
            <Button
              onClick={() => {
                router.push("/dashboard/input/tahunAjaran");
              }}
            >
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">No</TableHead>
                  <TableHead className="w-[10%]">Tahun</TableHead>
                  <TableHead className="flex-1">Semester</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
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
                  <TableHead className="w-[10%]">No</TableHead>
                  <TableHead className="w-[10%]">Tahun</TableHead>
                  <TableHead className="flex-1">Semester</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderData()}</TableBody>
            </Table>
          )}
          <Pagination
            meta={meta}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default DataTahun;
