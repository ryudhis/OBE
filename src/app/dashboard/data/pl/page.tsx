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
import React, { useState, useEffect } from "react";
import axiosConfig from '../../../../utils/axios';
import SkeletonTable from "@/components/SkeletonTable";

export interface pl {
  kode: string;
  deskripsi: string;
}

const DataPL = () => {
  const [PL, setPL] = useState<pl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getPL = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/pl");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setPL(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getPL();
  }, []);
  // id, kode, deskripsi

  const renderData = () => {
    return PL.map((pl, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{pl.kode}</TableCell>
          <TableCell>{pl.deskripsi}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <section className="flex justify-center items-center mt-20">
      <Card className="w-[1000px]">
        <CardHeader>
          <CardTitle>Tabel PL</CardTitle>
          <CardDescription>Profil Lulusan</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Deskripsi</TableHead>
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
                </TableRow>
              </TableHeader>
              <TableBody>{renderData()}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default DataPL;
