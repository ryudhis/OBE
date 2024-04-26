"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { RelationData } from "@/components/RelationData";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataCard } from "@/components/DataCard";

export interface MKinterface {
  kode: string;
  deskripsi: string;
  BK: BKItem[];
  CPMK: CPMKItem[];
  mahasiswa: mahasiswaItem[];
}

export interface CPMKItem {
  kode: string;
  deskripsi: string;
}

export interface BKItem {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
}

export interface transformedData{
  kode: string;
  deskripsi: string;
}

const formSchema = z.object({
  deskripsi: z.string().min(1).max(50),
});

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [mk, setMK] = useState<MKinterface | undefined>();
  const [mahasiswa, setMahasiswa] = useState<mahasiswaItem[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
    };

    axiosConfig
      .patch(`api/mk/${kode}`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          setRefresh(!refresh);
          toast({
            title: "Berhasil Edit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: response.data.message,
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Edit",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      });
  }

  const getMK = async () => {
    try {
      const response = await axiosConfig.get(`api/mk/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setMK(response.data.data);
      const prevSelected = response.data.data.mahasiswa.map(
        (item: mahasiswaItem) => item.nim
      );

      setSelected(prevSelected);
      setPrevSelected(prevSelected);

      form.reset({
        deskripsi: response.data.data.deskripsi,
      });
    } catch (error: any) {
      throw error;
    }
  };

  const getAllMahasiswa = async () => {
    try {
      const response = await axiosConfig.get("api/mahasiswa");

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMahasiswa(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const transformMahasiswaData = (mahasiswa: mahasiswaItem): transformedData => {
    return {
      kode: mahasiswa.nim, 
      deskripsi: mahasiswa.nama,
    };
  };

  const filteredMahasiswa = mahasiswa?.filter((mahasiswa) =>
    mahasiswa.nim.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheck = (nim: string) => {
    setSelected((prevSelected) => {
      if (!prevSelected.includes(nim)) {
        return [...prevSelected, nim];
      } else {
        return prevSelected.filter((item) => item !== nim);
      }
    });
  };

  const updateMahasiswa = async () => {
    if (mk) {
      let addedMahasiswaId: string[] = [];
      let removedMahasiswaId: string[] = [];

      addedMahasiswaId = selected.filter(
        (item) => !prevSelected.includes(item)
      );
      removedMahasiswaId = prevSelected.filter(
        (item) => !selected.includes(item)
      );

      const payload = {
        kode: mk?.kode,
        deskripsi: mk?.deskripsi,
        addedMahasiswaId: addedMahasiswaId,
        removedMahasiswaId: removedMahasiswaId,
      };

      try {
        const response = await axiosConfig.patch(
          `api/mk/relasi/${kode}`,
          payload
        );
        setRefresh(!refresh);
        if (response.data.status == 200 || response.data.status == 201) {
          toast({
            title: response.data.message,
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
    }
  };

  useEffect(() => {
    getAllMahasiswa();
  }, []);

  useEffect(() => {
    getMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (mk) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[400px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {mk.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell>: {mk.deskripsi}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit MK</DialogTitle>
                <DialogDescription>{mk.kode}</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='deskripsi' className='text-right'>
                      Deskripsi
                    </Label>
                    <Input
                      id='deskripsi'
                      {...form.register("deskripsi")} // Register the input with react-hook-form
                      className='col-span-3'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type='submit'>Simpan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className='mb-5'>
          <div className=' font-bold text-xl'>Data Relasi BK</div>
          <RelationData data={mk.BK} jenisData='BK' />
        </div>

        <div className='mb-5'>
          <div className=' font-bold text-xl'>Data Relasi CPMK</div>
          <RelationData data={mk.CPMK} jenisData='CPMK' />
        </div>
        
        {/* HEADER */}
        <div className="flex flex-row justify-between items-center mb-5">
          <div className=" font-bold text-xl">Sambungkan Mahasiswa</div>
          <input
            type="text"
            className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
            value={search}
            placeholder="Cari..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST OF Mahasiswa */}
        <div className="grid grid-cols-4 gap-4">
          {filteredMahasiswa && filteredMahasiswa.length > 0 ? (
            filteredMahasiswa?.map((mahasiswa, index) => {
              const transformedData = transformMahasiswaData(mahasiswa);
              return (
                <DataCard<transformedData>
                  key={index}
                  selected={selected}
                  handleCheck={handleCheck}
                  data={transformedData}
                />
              );
            })
          ) : (
            <div className="text-sm">Mahasiswa Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateMahasiswa}
          type="button"
          className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600"
        >
          Simpan
        </button>
      </main>
    );
  }
}
