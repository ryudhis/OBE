/* eslint-disable react-hooks/exhaustive-deps */
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
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  deskripsi: z.string().min(1).max(50),
  keterangan: z.string().min(1).max(50),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { accountData }  = useAccount();
  const [cpl, setCPl] = useState<CPL | undefined>();
  const [bk, setBK] = useState<BK[] | undefined>([]);
  const [cpmk, setCPMK] = useState<CPMK[] | undefined>([]);
  const [prevSelected1, setPrevSelected1] = useState<string[]>([]);
  const [selected1, setSelected1] = useState<string[]>([]);
  const [prevSelected2, setPrevSelected2] = useState<string[]>([]);
  const [selected2, setSelected2] = useState<string[]>([]);
  const [searchBK, setSearchBK] = useState<string>("");
  const [searchCPMK, setSearchCPMK] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
      keterangan: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
      keterangan: values.keterangan,
    };

    axiosConfig
      .patch(`api/cpl/${id}`, data)
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

  const filteredBK = bk?.filter((bk) =>
    bk.kode.toLowerCase().includes(searchBK.toLowerCase())
  );

  const filteredCPMK = cpmk?.filter((cpmk) =>
    cpmk.kode.toLowerCase().includes(searchCPMK.toLowerCase())
  );

  const getCPL = async () => {
    try {
      const response = await axiosConfig.get(`api/cpl/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail CPL prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setCPl(response.data.data);

        const prevSelected1 = response.data.data.BK.map(
          (item: BK) => item.kode
        );

        const prevSelected2 = response.data.data.CPMK.map(
          (item: CPMK) => item.kode
        );

        setSelected1(prevSelected1);
        setPrevSelected1(prevSelected1);

        setSelected2(prevSelected2);
        setPrevSelected2(prevSelected2);

        form.reset({
          deskripsi: response.data.data.deskripsi,
          keterangan: response.data.data.keterangan,
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getAllBK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/bk?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const getAllCPMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/cpmk?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPMK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCheck1 = (kode: string) => {
    setSelected1((prevSelected1) => {
      if (!prevSelected1.includes(kode)) {
        return [...prevSelected1, kode];
      } else {
        return prevSelected1.filter((item) => item !== kode);
      }
    });
  };

  const handleCheck2 = (kode: string) => {
    setSelected2((prevSelected2) => {
      if (!prevSelected2.includes(kode)) {
        return [...prevSelected2, kode];
      } else {
        return prevSelected2.filter((item) => item !== kode);
      }
    });
  };

  const updateRelation = async () => {
    let addedBKId: string[] = [];
    let removedBKId: string[] = [];
    let addedCPMKId: string[] = [];
    let removedCPMKId: string[] = [];

    addedBKId = selected1.filter((item) => !prevSelected1.includes(item));
    removedBKId = prevSelected1.filter((item) => !selected1.includes(item));
    addedCPMKId = selected2.filter((item) => !prevSelected2.includes(item));
    removedCPMKId = prevSelected2.filter((item) => !selected2.includes(item));

    const payload = {
      kode: cpl?.kode,
      deskripsi: cpl?.deskripsi,
      addedBKId: addedBKId,
      removedBKId: removedBKId,
      addedCPMKId: addedCPMKId,
      removedCPMKId: removedCPMKId,
      prodiId: accountData?.prodiId,
    };

    try {
      const response = await axiosConfig.patch(`api/cpl/relasi/${id}`, payload);
      setRefresh(!refresh);
      if (response.data.status == 200 || response.data.status == 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        console.log(response.data);
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  // ONLY FIRST TIME
  useEffect(() => {
    getAllBK();
    getAllCPMK();
  }, []);

  useEffect(() => {
    getCPL();
  }, [refresh]);

  if (cpl) {
    return (
      <main className='flex flex-col gap-5 w-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[300px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {cpl.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell>: {cpl.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Keterangan</strong>{" "}
                </TableCell>
                <TableCell>: {cpl.keterangan}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit CPL</DialogTitle>
                <DialogDescription>{cpl.kode}</DialogDescription>
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
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='keterangan' className='text-right'>
                      Keterangan
                    </Label>
                    <Input
                      id='keterangan'
                      {...form.register("keterangan")} // Register the input with react-hook-form
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
          <RelationData data={cpl.BK} jenisData='BK' />
        </div>

        <div className='mb-5'>
          <div className=' font-bold text-xl'>Data Relasi CPMK</div>
          <RelationData data={cpl.CPMK} jenisData='CPMK' />
        </div>

        {/* HEADER */}
        <div className='flex flex-row justify-between items-center mb-5'>
          <div className=' font-bold text-xl'>Sambungkan BK</div>
          <input
            type='text'
            className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
            value={searchBK}
            placeholder='Cari...'
            onChange={(e) => setSearchBK(e.target.value)}
          />
        </div>

        {/* LIST OF BK */}
        <div className='grid grid-cols-4 gap-4'>
          {filteredBK && filteredBK.length > 0 ? (
            filteredBK?.map((bk, index) => {
              return (
                <DataCard<BK>
                  key={index}
                  selected={selected1}
                  handleCheck={handleCheck1}
                  data={bk}
                />
              );
            })
          ) : (
            <div className='text-sm'>BK Tidak Ditemukan</div>
          )}
        </div>

        <div className='flex flex-row justify-between items-center mb-5'>
          <div className=' font-bold text-xl'>Sambungkan CPMK</div>
          <input
            type='text'
            className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
            value={searchCPMK}
            placeholder='Cari...'
            onChange={(e) => setSearchCPMK(e.target.value)}
          />
        </div>

        {/* LIST OF CPMK */}
        <div className='grid grid-cols-4 gap-4'>
          {filteredCPMK && filteredCPMK.length > 0 ? (
            filteredCPMK?.map((cpmk, index) => {
              return (
                <DataCard<CPMK>
                  key={index}
                  selected={selected2}
                  handleCheck={handleCheck2}
                  data={cpmk}
                />
              );
            })
          ) : (
            <div className='text-sm'>CPMK Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateRelation}
          type='button'
          className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600'
        >
          Simpan
        </button>
      </main>
    );
  }
}
