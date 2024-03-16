"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";

export interface cpl {
  kode: string;
  deskripsi: string;
  keterangan: string;
}

const DataCPL = () => {
  const [CPL, setCPL] = useState<cpl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getCPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/cpl");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPL(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getCPL();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return CPL.map((cpl, index) => {
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
    <>
      <h2 className="text-2xl font-bold text-center">DATA CPL</h2>
      {isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SkeletonTable rows={5} cols={3} />
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderData()}</TableBody>
        </Table>
      )}
    </>
  );
};

export default DataCPL;
