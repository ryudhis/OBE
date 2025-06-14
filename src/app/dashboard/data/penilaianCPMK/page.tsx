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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
import Swal from "sweetalert2";
import { SearchInput } from "@/components/Search";

const DataPenilaianCPMK = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const [templates, setTemplates] = useState<any[]>([]);
  const [MKOptions, setMKOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMK, setFilterMK] = useState("default");
  const [refresh, setRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const getTemplatePenilaianCPMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/templatePenilaianCPMK?prodi=${accountData?.prodiId}&page=${currentPage}&MK=${filterMK}&search=${searchQuery}&limit=9999`
      );
      if (response.data.status === 200) {
        setTemplates(response.data.data);
        setMeta({
          totalItems: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages,
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMKOptions = async () => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}&limit=99999`
      );
      if (response.data.status === 200) {
        setMKOptions(response.data.data);
      }
    } catch (error) {
      console.error("MK fetch error:", error);
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    getTemplatePenilaianCPMK();
    getMKOptions();
  }, [refresh, currentPage, filterMK, searchQuery]);

  const calculateBobot = (template: any) => {
    let total = 0;
    template.penilaianCPMK.forEach((p: { kriteria: any[] }) => {
      p.kriteria.forEach((k: { bobot: number }) => {
        total += k.bobot;
      });
    });
    return total;
  };

  const renderData = (template: any) => {
    if (!template.penilaianCPMK || template.penilaianCPMK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className='text-center font-semibold'>
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    return template.penilaianCPMK.map((pCPMK: any) => (
      <TableRow key={pCPMK.kode}>
        <TableCell>{pCPMK.kode}</TableCell>
        <TableCell>{pCPMK.CPL?.kode}</TableCell>
        <TableCell>{pCPMK.CPMK?.kode}</TableCell>
        <TableCell>{pCPMK.tahapPenilaian}</TableCell>
        <TableCell>{pCPMK.teknikPenilaian}</TableCell>
        <TableCell>{pCPMK.instrumen}</TableCell>
        <TableCell>
          {pCPMK.kriteria.map((item: any, index: number) => (
            <div key={index}>{item.kriteria}</div>
          ))}
        </TableCell>
        <TableCell>
          {pCPMK.kriteria.map((item: any, index: number) => (
            <div key={index}>{item.bobot}</div>
          ))}
        </TableCell>
        <TableCell>{pCPMK.batasNilai}</TableCell>
        <TableCell className='flex gap-2'>
          <Button
            variant='destructive'
            onClick={() => delPenilaianCPMK(pCPMK.id)}
          >
            Hapus
          </Button>
          <Button
            onClick={() =>
              router.push(`/dashboard/data/penilaianCPMK/${pCPMK.id}/`)
            }
          >
            Details
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <section className='flex justify-center items-center mt-20 mb-10 flex-col'>
      <Card className='w-[1200px]'>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='flex flex-col'>
            <CardTitle>Tabel Penilaian CPMK</CardTitle>
            <CardDescription>
              Penilaian Capaian Pembelajaran Mata Kuliah
            </CardDescription>
          </div>
          <div className='flex gap-5 items-center'>
            <SearchInput onSearch={handleSearch} />
            <Select
              onValueChange={(value) => setFilterMK(value)}
              defaultValue={filterMK}
              value={filterMK}
            >
              <SelectTrigger className='w-[30%]'>
                <SelectValue placeholder='Pilih MK' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='default'>Pilih MK</SelectItem>
                {MKOptions.map((mk, index) => (
                  <SelectItem key={index} value={mk.kode}>
                    {mk.kode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => router.push("/dashboard/input/penilaianCPMK")}
            >
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-5'>
          {!isLoading &&
            templates.map((template) => (
              <Collapsible
                key={template.id}
                className='w-full border rounded-lg shadow-sm py-4 space-y-4'
              >
                <CollapsibleTrigger className='w-full text-center text-lg font-bold'>
                  {template.MK.kode} - {template.MK.deskripsi}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>CPL</TableHead>
                        <TableHead>CPMK</TableHead>
                        <TableHead>Tahap</TableHead>
                        <TableHead>Teknik</TableHead>
                        <TableHead>Instrumen</TableHead>
                        <TableHead>Kriteria</TableHead>
                        <TableHead>Bobot</TableHead>
                        <TableHead>Batas</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderData(template)}</TableBody>
                  </Table>
                  <p
                    className={`ml-[800px] font-semibold mb-2 ${
                      calculateBobot(template) !== 100
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    Total Bobot : {calculateBobot(template)}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default DataPenilaianCPMK;
