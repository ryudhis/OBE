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
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { SearchInput } from "@/components/Search";

const DataNilai = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [refresh, setRefresh] = useState(false);
  const [inputNilai, setInputNilai] = useState<InputNilai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [MK, setMK] = useState<MK[]>([]);
  const [filterMK, setFilterMK] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const getInputNilai = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/inputNilai?prodi=${accountData?.prodiId}&page=${currentPage}&MK=${filterMK}&search=${searchQuery}`
      );
      if (response.data.status !== 400) {
        setInputNilai(response.data.data);
        setMeta({
          totalItems: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages,
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}&limit=99999`
      );
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

  const delInputNilai = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/inputNilai/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data inputNilai",
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
    getMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Trigger useEffect only on initial mount

  useEffect(() => {
    getInputNilai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, currentPage, filterMK, searchQuery]); // Trigger useEffect only on initial mount

  if (accountData?.role === "Admin Prodi") {
    toast({
      title: "Anda tidak memiliki akses untuk page data Nilai.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const renderData = () => {
    if (inputNilai.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return inputNilai?.map((nilai) => {
      return (
        <TableRow key={nilai.id}>
          <TableCell className="w-[10%]">{nilai.penilaianCPMK.kode}</TableCell>
          <TableCell className="flex-1">{nilai.mahasiswaNim}</TableCell>
          <TableCell className="flex-1">{nilai.mahasiswa.nama}</TableCell>
          <TableCell>
            {nilai.nilai.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {item}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>
            {nilai.nilai.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {(
                  item *
                  (nilai.penilaianCPMK.kriteria[index].bobot * 0.01)
                ).toFixed(2)}
              </TableRow>
            ))}
          </TableCell>
          <TableCell className="w-[10%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => delInputNilai(nilai.id)}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/nilai/${nilai.id}/`);
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
    <section className="flex justify-center items-center my-20 mb-10">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel Nilai Mahasiswa</CardTitle>
            <CardDescription>Nilai Mahasiswa</CardDescription>
          </div>
          <div className="flex gap-5 items-center">
            <SearchInput onSearch={handleSearch} />
            <Select
              onValueChange={(value) => {
                setFilterMK(value);
              }}
              defaultValue={filterMK}
              value={filterMK}
              required
            >
              <SelectTrigger className="w-[30%]">
                <SelectValue placeholder="Pilih MK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Pilih MK</SelectItem>
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
                router.push("/dashboard/input/nilai");
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
                  <TableHead className="w-[10%]">PCPMK ID</TableHead>
                  <TableHead className="flex-1">NIM</TableHead>
                  <TableHead className="flex-1">Nama</TableHead>
                  <TableHead className="w-[10%]">Nilai Asli</TableHead>
                  <TableHead className="w-[10%]">Nilai Pembobotan</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
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
                  <TableHead className="w-[10%]">PCPMK ID</TableHead>
                  <TableHead className="flex-1">NIM</TableHead>
                  <TableHead className="flex-1">Nama</TableHead>
                  <TableHead className="w-[10%]">Nilai Asli</TableHead>
                  <TableHead className="w-[10%]">Nilai Pembobotan</TableHead>
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

export default DataNilai;
