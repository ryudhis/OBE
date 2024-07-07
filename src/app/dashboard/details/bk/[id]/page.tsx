"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { DataCard } from "@/components/DataCard";
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
import { accountProdi } from "@/app/interface/input";
import { getAccountData } from "@/utils/api";
import { useRouter } from "next/navigation";

export interface BKInterface {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
  MK: MKItem[];
}

export interface MKItem {
  kode: string;
  deskripsi: string;
}

const formSchema = z.object({
  deskripsi: z.string().min(1).max(50),
  min: z.string().min(0).max(10),
  max: z.string().min(0).max(10),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [account, setAccount] = useState<accountProdi>();
  const [bk, setBk] = useState<BKInterface | undefined>();
  const [mk, setMk] = useState<MKItem[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const data = await getAccountData();
      if (data.role === "Dosen") {
        router.push("/dashboard");
        toast({
          title: "Kamu Tidak Memiliki Akses Ke Halaman Detail BK",
          variant: "destructive",
        });
      }
      setAccount(data);
      getAllMK(data.prodiId);
    } catch (error) {
      console.log(error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
      min: "",
      max: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
      min: Number(values.min),
      max: Number(values.max),
    };

    axiosConfig
      .patch(`api/bk/${id}`, data)
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
  const getBK = async () => {
    try {
      const response = await axiosConfig.get(`api/bk/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setBk(response.data.data);
      const prevSelected = response.data.data.MK.map(
        (item: MKItem) => item.kode
      );

      setSelected(prevSelected);
      setPrevSelected(prevSelected);

      form.reset({
        deskripsi: response.data.data.deskripsi,
        min: String(response.data.data.min),
        max: String(response.data.data.max),
      });
    } catch (error: any) {
      throw error;
    }
  };

  const getAllMK = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/mk?prodi=${prodiId}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMk(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const filteredMK = mk?.filter((mk) =>
    mk.kode.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheck = (kode: string) => {
    setSelected((prevSelected) => {
      if (!prevSelected.includes(kode)) {
        return [...prevSelected, kode];
      } else {
        return prevSelected.filter((item) => item !== kode);
      }
    });
  };

  const updateMK = async () => {
    if (bk) {
      if (selected.length < bk.min) {
        toast({
          title: "Jumlah MK yang dipilih kurang dari minimal",
          variant: "destructive",
        });
      } else if (selected.length > bk.max) {
        toast({
          title: "Jumlah MK yang dipilih melebihi maksimal",
          variant: "destructive",
        });
      } else {
        let addedMKId: string[] = [];
        let removedMKId: string[] = [];

        addedMKId = selected.filter((item) => !prevSelected.includes(item));
        removedMKId = prevSelected.filter((item) => !selected.includes(item));

        const payload = {
          kode: bk?.kode,
          deskripsi: bk?.deskripsi,
          min: bk?.min,
          max: bk?.max,
          addedMKId: addedMKId,
          removedMKId: removedMKId,
        };

        try {
          const response = await axiosConfig.patch(
            `api/bk/relasi/${id}`,
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
    }
  };

  // ONLY FIRST TIME
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
  }, []); // Trigger useEffect only on initial mount

  useEffect(() => {
    getBK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    getBK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (bk) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[300px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {bk.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell>: {bk.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Minimal MK</strong>{" "}
                </TableCell>
                <TableCell>: {bk.min}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Maksimal MK</strong>{" "}
                </TableCell>
                <TableCell>: {bk.max}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit BK</DialogTitle>
                <DialogDescription>{bk.kode}</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='deskripsi' className='text-right'>
                      Deskripsi
                    </Label>
                    <Input
                      id='deskripsi'
                      {...form.register("deskripsi")}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='min' className='text-right'>
                      Minimal MK
                    </Label>
                    <Input
                      id='min'
                      {...form.register("min")}
                      className='col-span-3'
                      type='number'
                      min={0}
                      max={10}
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='max' className='text-right'>
                      Maksimal MK
                    </Label>
                    <Input
                      id='max'
                      {...form.register("max")}
                      className='col-span-3'
                      type='number'
                      min={0}
                      max={10}
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
          <div className=' font-bold text-xl'>Data Relasi MK</div>
          <RelationData data={bk.MK} jenisData='MK' />
        </div>

        {/* HEADER */}
        <div className='flex flex-row justify-between items-center mb-5'>
          <div className=' font-bold text-xl'>Sambungkan MK</div>
          <input
            type='text'
            className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
            value={search}
            placeholder='Cari...'
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST OF MK */}
        <div className='grid grid-cols-4 gap-4'>
          {filteredMK && filteredMK.length > 0 ? (
            filteredMK?.map((mk, index) => {
              return (
                <DataCard<MKItem>
                  key={index}
                  selected={selected}
                  handleCheck={handleCheck}
                  data={mk}
                />
              );
            })
          ) : (
            <div className='text-sm'>MK Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateMK}
          type='button'
          className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600'
        >
          Simpan
        </button>
      </main>
    );
  }
}
