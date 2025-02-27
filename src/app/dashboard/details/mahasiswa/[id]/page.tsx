"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";
import { RadarChartComponent } from "@/components/RadarChart";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { accountData } = useAccount();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | undefined>();
  const [cpl, setCPL] = useState<CPL[]>([]);
  const [data, setData] = useState<{ subject: string; percentage: number }[]>(
    []
  );

  const countTotalSKS = (mahasiswa: Mahasiswa): number => {
    return mahasiswa.kelas.reduce((total, kelasItem) => {
      return total + parseInt(kelasItem.MK.sks);
    }, 0);
  };

  const getMahasiswa = async () => {
    try {
      const response = await axiosConfig.get(`api/mahasiswa/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail PL prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setMahasiswa(response.data.data);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getCPL = async () => {
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
    }
  };

  useEffect(() => {
    getMahasiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCPL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mahasiswa && cpl) {
      const performaMahasiswa = mahasiswa.performaMahasiswa || [];
      const result = cpl.map((cpl) => {
        const match = performaMahasiswa.find(
          (performance) => performance.CPLId === cpl.id
        );
        return {
          subject: cpl.kode,
          percentage: match ? match.nilai : 0,
        };
      });
      setData(result);
    }
  }, [mahasiswa, cpl]);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page detail PL prodi .",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  if (mahasiswa) {
    return (
      <main className="w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5">
        <p className="ml-2 font-bold text-2xl">Detail Mahasiswa</p>
        <div className="flex">
          <Table className="w-[1000px] table-fixed mb-5">
            <TableBody>
              <TableRow>
                <TableCell className="w-[20%] p-2">
                  <strong>Nama</strong>
                </TableCell>
                <TableCell className="p-2">: {mahasiswa.nama} </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="w-[20%] p-2">
                  <strong>NIM</strong>{" "}
                </TableCell>
                <TableCell className="p-2">: {mahasiswa.nim}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="w-[20%] p-2">
                  <strong>Prodi</strong>
                </TableCell>
                <TableCell className="p-2">: {mahasiswa.prodi.nama} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[20%] p-2">
                  <strong>Jumlah Kelas</strong>
                </TableCell>
                <TableCell className="p-2">
                  : {mahasiswa.kelas.length}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[20%] p-2">
                  <strong>Jumlah SKS</strong>
                </TableCell>
                <TableCell className="p-2">
                  : {countTotalSKS(mahasiswa)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-8 items-center">
          <h3 className="text-2xl font-bold">Performa Mahasiswa</h3>
          <RadarChartComponent data={data} />
        </div>
      </main>
    );
  }
}
