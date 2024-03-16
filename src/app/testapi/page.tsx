"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../utils/axios";

export interface wang {
  kode: string;
  deskripsi: string;
  keterangan: string;
}

const TestApi = () => {
  const [cpl, setCpl] = useState<wang[]>([]);
  const getCPL = async () => {
    try {
      const response = await axiosConfig.get("api/cpl");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCpl(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCPL();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return cpl.map((cpl, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{cpl.kode}</TableCell>
          <TableCell>{cpl.deskripsi}</TableCell>
          <TableCell>{cpl.keterangan}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Table>
      <TableCaption className="text-2xl font-bold ">DATA CPL</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Kode</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Keterangan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{renderData()}</TableBody>
    </Table>
  );
};

export default TestApi;
