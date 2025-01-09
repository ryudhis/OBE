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

const DataAkun = () => {
  const router = useRouter();
  const [akun, setAkun] = useState<Account[]>([]);
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });

  const getAkun = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(`api/account?page=${currentPage}`);
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setAkun(response.data.data);
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

  const delAkun = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/account/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data BK",
            variant: "default",
          });
          getAkun();
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
    getAkun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  if (accountData?.role !== "Super Admin") {
    toast({
      title: "Anda tidak memiliki akses untuk page data akun.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (akun.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return akun.map((akun) => {
      return (
        <TableRow key={akun.id}>
          <TableCell className="flex-1 text-center">{akun.nama}</TableCell>
          <TableCell className="w-[18%] text-center">{akun.email}</TableCell>
          <TableCell className="w-[18%] text-center">{akun.role}</TableCell>
          <TableCell className="w-[18%] text-center">
            {akun.prodi.nama}
          </TableCell>
          <TableCell className="w-[18%] text-center">
            <Button variant="destructive" onClick={() => delAkun(akun.id)}>
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
            <CardTitle>Tabel Akun</CardTitle>
            <CardDescription>Akun</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/akun");
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
                  <TableHead className="flex-1 text-center">Nama</TableHead>
                  <TableHead className="w-[18%] text-center">Email</TableHead>
                  <TableHead className="w-[18%] text-center">Role</TableHead>
                  <TableHead className="w-[18%] text-center">Prodi</TableHead>
                  <TableHead className="w-[18%] text-center">Aksi</TableHead>
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
                  <TableHead className="flex-1 text-center">Nama</TableHead>
                  <TableHead className="w-[18%] text-center">Email</TableHead>
                  <TableHead className="w-[18%] text-center">Role</TableHead>
                  <TableHead className="w-[18%] text-center">Prodi</TableHead>
                  <TableHead className="w-[18%] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderData()}</TableBody>
            </Table>
          )}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            meta={meta}
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default DataAkun;
