"use client";
import { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import axiosConfig from "../../../../../utils/axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/app/contexts/AccountContext";

interface PLItem {
  kode: string;
  deskripsi: string;
}

const PLExcel = () => {
  const router = useRouter();
  const accountData = useAccount();
  const [pl, setPl] = useState<PLItem[]>([]);
  const { toast } = useToast();

  const exportTemplate = () => {
    // Define headers
    const headers = [
      { header: "Kode", key: "Kode" },
      { header: "Deskripsi", key: "Deskripsi" },
    ];

    // Create worksheet with headers
    const ws = XLSX.utils.json_to_sheet([], {
      header: headers.map((h) => h.key),
    });

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Export workbook
    XLSX.writeFile(wb, "Template PL.xlsx");
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsBinaryString(e.target.files[0]);
    }
    reader.onload = (e) => {
      const dataWorkbook = e.target?.result;
      const workbook = XLSX.read(dataWorkbook, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let parsedData: PLItem[] = XLSX.utils.sheet_to_json(sheet);

      // Filter parsedData to only include Nama and NIM data
      parsedData = parsedData.map((item: any) => ({
        kode: item.Kode,
        deskripsi: item.Deskripsi,
      }));
      setPl(parsedData);
    };
  };

  function onSubmit(e: any) {
    e.preventDefault();

    const data = {
      PL: pl,
      prodiId: accountData?.prodiId,
    };

    axiosConfig
      .post("api/pl/excel", data)
      .then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Kode Sudah Ada!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Submit",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      });
  }

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input excel pl.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className="flex h-screen mt-[-100px] justify-center items-center">
      <Card className="w-[1000px]">
        <CardHeader>
          <CardTitle>Input PL Excel</CardTitle>
          <CardDescription>Data Profil Lulusan</CardDescription>
          <div className="flex items-center justify-end gap-4">
            <Button
              className="w-[130px] self-end"
              onClick={() => {
                exportTemplate();
              }}
            >
              Export Template
            </Button>
            <Button
              className="w-[100px] self-end"
              onClick={() => {
                router.push(`/dashboard/input/pl/`);
              }}
            >
              Input Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          {pl.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(pl[0]).map((key, index) => (
                    <TableHead key={index}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pl.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, index) => (
                      <TableCell key={index}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={onSubmit}>Submit</Button>
        </CardFooter>
      </Card>
    </section>
  );
};

export default PLExcel;
