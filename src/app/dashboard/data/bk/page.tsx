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
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { SearchInput } from "@/components/Search";

const DataBK = () => {
  const router = useRouter();
  const [BK, setBK] = useState<BK[]>([]);
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const getBK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/bk?prodi=${accountData?.prodiId}&page=${currentPage}&search=${searchQuery}`
      );
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
      setMeta({
        totalItems: response.data.meta.totalItems,
        totalPages: response.data.meta.totalPages,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const delBK = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/bk/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data BK",
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
    getBK();
  }, [refresh, currentPage, searchQuery]); // Trigger useEffect only on initial mount

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page data BK.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (BK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    return BK.map((bk, index) => {
      return (
        <TableRow key={index}>
          <TableCell className="w-[8%]">{bk.kode}</TableCell>
          <TableCell className="flex-1">
            {bk.deskripsi.length > 20
              ? bk.deskripsi.slice(0, 18) + "..."
              : bk.deskripsi}
          </TableCell>
          <TableCell className="w-[4%]">{bk.min}</TableCell>
          <TableCell className="w-[4%]">{bk.max}</TableCell>
          <TableCell className="w-[18%]">
            {bk.CPL.length > 0
              ? bk.CPL.map((item) => item.kode).join(", ")
              : " - "}
          </TableCell>
          <TableCell className="w-[18%]">
            {bk.MK.length > 0
              ? bk.MK.map((item) => item.kode).join(", ")
              : " - "}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button variant="destructive" onClick={() => delBK(bk.id)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/data/bk/${bk.id}/`);
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
            <CardTitle>Tabel BK</CardTitle>
            <CardDescription>Bahan Kajian</CardDescription>
          </div>
          <div className="flex gap-5 items-center">
            <SearchInput onSearch={handleSearch} />
            <Button
              onClick={() => {
                router.push("/dashboard/input/bk");
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
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[4%]">Min</TableHead>
                  <TableHead className="w-[4%]">Max</TableHead>
                  <TableHead className="w-[18%]">CPL</TableHead>
                  <TableHead className="w-[18%]">MK</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={7} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">Kode</TableHead>
                  <TableHead className="flex-1">Deskripsi</TableHead>
                  <TableHead className="w-[4%]">Min</TableHead>
                  <TableHead className="w-[4%]">Max</TableHead>
                  <TableHead className="w-[18%]">CPL</TableHead>
                  <TableHead className="w-[18%]">MK</TableHead>
                  <TableHead className="w-[8%]">Aksi</TableHead>
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

export default DataBK;
