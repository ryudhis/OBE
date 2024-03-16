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

export interface mk {
  kode: string;
  deskripsi: string;
}

const DataMK = () => {
  const [MK, setMK] = useState<mk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/mk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMK(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getMK();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return MK.map((mk, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{mk.kode}</TableCell>
          <TableCell>{mk.deskripsi}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center">DATA MK</h2>
      {isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SkeletonTable rows={5} cols={2} />
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderData()}</TableBody>
        </Table>
      )}
    </>
  );
};

export default DataMK;
