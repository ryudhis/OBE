"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";
import { RadarChartComponent } from "@/components/RadarChart";
import { BarChartComponent } from "@/components/BarChart";
import html2pdf from "html2pdf.js";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { accountData } = useAccount();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | undefined>();
  const [dataCPL, setDataCPL] = useState<
    { subject: string; percentage: number }[]
  >([]);
  const [dataCPMK, setDataCPMK] = useState<
    { subject: string; percentage: number }[]
  >([]);
  const [dataMK, setDataMK] = useState<
    { subject: string; percentage: number }[]
  >([]);

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

  useEffect(() => {
    getMahasiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mahasiswa) {
      const performaCPL = mahasiswa?.performaMahasiswa || [];

      const resultCPL = performaCPL.map((performance) => {
        return {
          subject: performance.CPL?.kode || "Unknown",
          percentage: performance.nilai,
        };
      });
      setDataCPL(resultCPL);

      const performaCPMK = mahasiswa?.mahasiswa_CPMK || [];

      const resultCPMK = performaCPMK.map((performance) => {
        return {
          subject: performance.CPMK?.kode || "Unknown",
          percentage: performance.nilai,
        };
      });

      setDataCPMK(resultCPMK);

      const performaMK = mahasiswa?.mahasiswa_MK || [];
      const resultMK = performaMK.map((performance) => {
        return {
          subject: performance.MKId,
          percentage: performance.nilai,
        };
      });
      setDataMK(resultMK);
    }
  }, [mahasiswa]);

  const generatePDF = () => {
    const element = document.getElementById("main-content");
    const options = {
      margin: 1,
      filename: `Detail_Mahasiswa_${mahasiswa?.nim || "unknown"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    if (element) {
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Element not found for PDF generation.");
    }
  };

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
      <main className="w-screen min-h-screen max-w-7xl mx-auto py-20 bg-[#FAFAFA] p-5">
        <p className="ml-2 font-bold text-2xl">Detail Mahasiswa</p>
        <div className="flex justify-end mb-4">
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate
          </button>
        </div>
        <div id="main-content">
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
                  <TableCell className="p-2">
                    : {mahasiswa.prodi.nama}{" "}
                  </TableCell>
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
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-2xl font-bold">Performa CPL Mahasiswa</h3>
            <RadarChartComponent data={dataCPL} />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-2xl font-bold">Performa CPMK Mahasiswa</h3>
            <RadarChartComponent data={dataCPMK} />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <BarChartComponent
              data={dataMK}
              tipe="Performa MK Mahasiswa"
              title="Performa MK Mahasiswa"
            />
          </div>
        </div>
      </main>
    );
  }
}
