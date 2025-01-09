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

const DataPenilaianCPMK = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [penilaianCPMK, setPenilaianCPMK] = useState<PenilaianCPMK[]>([]);
  const [MK, setMK] = useState<MK[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMK, setFilterMK] = useState("default");
  const [refresh, setRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 0,
  });

  let filteredPCPMK = penilaianCPMK;
  let totalBobot = 0;

  if (filterMK !== "default") {
    filteredPCPMK = penilaianCPMK.filter((pcpmk) => pcpmk.MKkode === filterMK);

    filteredPCPMK.map((pcpmk) => {
      pcpmk.kriteria.map((kriteria) => {
        totalBobot += kriteria.bobot;
      });
    });
  }

  const getPenilaianCPMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/penilaianCPMK?prodi=${accountData?.prodiId}&page=${currentPage}`
      );
      if (response.data.status !== 400) {
        setPenilaianCPMK(response.data.data);
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

  const getMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}`
      );
      if (response.data.status !== 400) {
        setMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const delPenilaianCPMK = async (id: number) => {
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
        const response = await axiosConfig.delete(`api/penilaianCPMK/${id}`);
        if (response.data.status === 200 || response.data.status === 201) {
          toast({
            title: "Berhasil menghapus data penilaian CPMK",
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
    getPenilaianCPMK();
    getMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, currentPage]); // Trigger useEffect only on initial mount

  const renderData = () => {
    if (filteredPCPMK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center font-semibold">
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    return filteredPCPMK.map((pCPMK) => {
      return (
        <TableRow key={pCPMK.kode}>
          <TableCell className="w-[2%]">{pCPMK.kode}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.MKkode}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.CPL.kode}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.CPMK.kode}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.tahapPenilaian}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.teknikPenilaian}</TableCell>
          <TableCell className="w-[7%]">{pCPMK.instrumen}</TableCell>
          <TableCell>
            {pCPMK.kriteria.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {item.kriteria}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>
            {pCPMK.kriteria.map((item, index) => (
              <TableRow key={index} className="flex-1">
                {item.bobot}
              </TableRow>
            ))}
          </TableCell>
          <TableCell>{pCPMK.batasNilai}</TableCell>
          <TableCell className="w-[7%] flex gap-2">
            <Button
              variant="destructive"
              onClick={() => delPenilaianCPMK(pCPMK.id)}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/penilaianCPMK/${pCPMK.id}/`);
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
    <section className="flex justify-center items-center mt-20 mb-10 flex-col">
      <Card className="w-[1200px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
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
                  <TableHead className="w-[2%]">ID</TableHead>
                  <TableHead className="w-[7%]">MK</TableHead>
                  <TableHead className="w-[7%]">CPL</TableHead>
                  <TableHead className="w-[7%]">CPMK</TableHead>
                  <TableHead className="w-[7%]">Tahap Penilaian</TableHead>
                  <TableHead className="w-[7%]">Teknik Penilaian</TableHead>
                  <TableHead className="w-[7%]">Instrumen</TableHead>
                  <TableHead className="w-[20%]">Kriteria</TableHead>
                  <TableHead className="flex-1">Bobot</TableHead>
                  <TableHead className="flex-1">Batas Nilai</TableHead>
                  <TableHead className="w-[10%]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SkeletonTable rows={5} cols={11} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[2%]">ID</TableHead>
                  <TableHead className="w-[7%]">MK</TableHead>
                  <TableHead className="w-[7%]">CPL</TableHead>
                  <TableHead className="w-[7%]">CPMK</TableHead>
                  <TableHead className="w-[7%]">Tahap Penilaian</TableHead>
                  <TableHead className="w-[7%]">Teknik Penilaian</TableHead>
                  <TableHead className="w-[7%]">Instrumen</TableHead>
                  <TableHead className="flex-1">Kriteria</TableHead>
                  <TableHead className="flex-1">Bobot</TableHead>
                  <TableHead className="flex-1">Batas Nilai</TableHead>
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
        {filterMK !== "default" && filteredPCPMK.length !== 0 && (
          <p
            className={`ml-[800px] font-semibold mb-2 ${
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
