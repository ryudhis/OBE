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
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { accountProdi } from "@/app/interface/input";
import { getAccountData } from "@/utils/api";

export interface prodi {
  kode: string;
  nama: string;
}

const DataProdi = () => {
  const router = useRouter();
  const [account, setAccount] = useState<accountProdi>();
  const [prodi, setProdi] = useState<prodi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getAccountData();
      setAccount(data);
      getProdi();
    } catch (error) {
      console.log(error);
    }
  };

  const getProdi = async () => {
    try {
      const response = await axiosConfig.get(`api/prodi?`);
      if (response.data.status !== 400) {
        setProdi(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const delProdi = async (kode: string) => {
    try {
      const response = await axiosConfig.delete(`api/prodi/${kode}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data PL",
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    setIsLoading(true); // Set loading to true when useEffect starts
    fetchData()
      .catch((error) => {
        console.error("Error fetching account data:", error);
      })
      .finally(() => {
        setIsLoading(false); // Set loading to false when useEffect completes
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]); // Trigger useEffect only on initial mount

  const renderData = () => {
    return prodi.map((prodi, index) => {
      return (
        <TableRow key={index}>
          <TableCell className='w-[10%]'>{prodi.kode}</TableCell>
          <TableCell className='flex-1'>
            {prodi.nama.length > 20
              ? prodi.nama.slice(0, 18) + "..."
              : prodi.nama}
          </TableCell>
          <TableCell className='w-[10%] flex gap-2'>
            <Button variant='destructive' onClick={() => delProdi(prodi.kode)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/prodi/${prodi.kode}/`);
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
    <section className='flex justify-center items-center mt-20'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='flex flex-col'>
            <CardTitle>Tabel Prodi</CardTitle>
            <CardDescription>Program Studi</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/prodi");
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
                  <TableHead className='w-[10%]'>Kode</TableHead>
                  <TableHead className='flex-1'>Nama</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
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
                  <TableHead className='w-[10%]'>Kode</TableHead>
                  <TableHead className='flex-1'>Nama</TableHead>
                  <TableHead className='w-[10%]'>Aksi</TableHead>
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

export default DataProdi;
