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
import axiosConfig from "../../../../utils/axios";
import SkeletonTable from "@/components/SkeletonTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export interface akun {
  id: string;
  nama: string;
  email: string;
  role: string;
  kelas: kelas[];
}

export interface kelas {
  id: string;
  nama: string;
}

const DataAkun = () => {
  const router = useRouter();
  const [akun, setAkun] = useState<akun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getAkun = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get("api/account");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setAkun(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const delAkun = async (id: string) => {
    try {
      const response = await axiosConfig.delete(`api/account/${id}`);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Berhasil menghapus data BK",
          variant: "default",
        });
        getAkun();
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
    getAkun();
  }, []);

  const renderData = () => {
    return akun.map((akun) => {
      return (
        <TableRow key={akun.id}>
          <TableCell className="flex-1 text-center">{akun.nama}</TableCell>
          <TableCell className="w-[18%] text-center">{akun.email}</TableCell>
          <TableCell className="w-[18%] text-center">{akun.role}</TableCell>
          <TableCell className="w-[18%] flex gap-2 text-center">
            <Button variant="destructive" onClick={() => delAkun(akun.id)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/akun/${akun.id}/`);
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
    <section className="flex justify-center items-center mt-20">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Tabel Akun</CardTitle>
            <CardDescription>Akun</CardDescription>
          </div>
          <Button
            onClick={() => {
              router.push("/dashboard/input/akun");
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
                  <TableHead className="flex-1 text-center">Nama</TableHead>
                  <TableHead className="w-[18%] text-center">Email</TableHead>
                  <TableHead className="w-[18%] text-center">Role</TableHead>
                  <TableHead className="w-[18%] text-center">Aksi</TableHead>
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
                  <TableHead className="flex-1 text-center">Nama</TableHead>
                  <TableHead className="w-[18%] text-center">Email</TableHead>
                  <TableHead className="w-[18%] text-center">Role</TableHead>
                  <TableHead className="w-[18%] text-center">Aksi</TableHead>
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

export default DataAkun;
