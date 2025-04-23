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

const DataPL = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [PL, setPL] = useState<PL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const getPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/pl?prodi=${accountData?.prodiId}&page=${currentPage}&search=${searchQuery}`
      );
      if (response.data.status !== 400) {
        setPL(response.data.data);
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

  const delPL = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/pl/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data PL",
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
    getPL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, currentPage, searchQuery]); // Trigger useEffect only on initial mount

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page data PL.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (PL.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return PL.map((pl, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[10%]">{pl.kode}</TableCell>
          <TableCell className="flex-1">
            {pl.deskripsi.length > 20
              ? pl.deskripsi.slice(0, 18) + "..."
              : pl.deskripsi}
          </TableCell>
          <TableCell className="w-[20%]">
            {pl.CPL.length > 0
              ? pl.CPL.map((item) => item.kode).join(", ")
              : " - "}
          </TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button variant="destructive" onClick={() => delPL(pl.id)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/data/pl/${pl.id}/`);
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
    <section className="flex justify-center items-center mt-20 mb-10">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel PL</CardTitle>
            <CardDescription>Profil Lulusan</CardDescription>
          </div>
          <div className="flex gap-5 items-center">
            <SearchInput onSearch={handleSearch} />
            <Button
              onClick={() => {
                router.push("/dashboard/input/pl");
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
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[20%]">CPL</TableHead>
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
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[20%]">CPL</TableHead>
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

export default DataPL;
