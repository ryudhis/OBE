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

export interface bk {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

const DataBK = () => {
  const [BK, setBK] = useState<bk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getBK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/bk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getBK();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return BK.map((bk, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{bk.kode}</TableCell>
          <TableCell>{bk.deskripsi}</TableCell>
          <TableCell>{bk.min}</TableCell>
          <TableCell>{bk.max}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center">DATA BK</h2>
      {isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
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
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderData()}</TableBody>
        </Table>
      )}
    </>
  );
};

export default DataBK;
