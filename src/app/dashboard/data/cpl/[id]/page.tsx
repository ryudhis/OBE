/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { DataCard } from "@/components/DataCard";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "@/app/contexts/AccountContext";
import { useKunci } from "@/app/contexts/KunciContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  deskripsi: z.string().min(1),
  deskripsiInggris: z.string().min(1),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { accountData } = useAccount();
  const { kunciData } = useKunci();
  const [cpl, setCPl] = useState<CPL | undefined>();
  const [bk, setBK] = useState<BK[] | undefined>([]);
  const [prevSelected1, setPrevSelected1] = useState<string[]>([]);
  const [selected1, setSelected1] = useState<string[]>([]);
  const [searchBK, setSearchBK] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
      deskripsiInggris: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
      deskripsiInggris: values.deskripsiInggris,
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

        form.reset({
          deskripsi: response.data.data.deskripsi,
          deskripsiInggris: response.data.data.deskripsiInggris,
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getAllBK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/bk?prodi=${accountData?.prodiId}&limit=99999`
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

  const handleCheck1 = (kode: string) => {
    setSelected1((prevSelected1) => {
      if (!prevSelected1.includes(kode)) {
        return [...prevSelected1, kode];
      } else {
        return prevSelected1.filter((item) => item !== kode);
      }
    });
  };

  const updateRelation = async () => {
    let addedBKId: string[] = [];
    let removedBKId: string[] = [];

    addedBKId = selected1.filter((item) => !prevSelected1.includes(item));
    removedBKId = prevSelected1.filter((item) => !selected1.includes(item));

    const payload = {
      kode: cpl?.kode,
      deskripsi: cpl?.deskripsi,
      addedBKId: addedBKId,
      removedBKId: removedBKId,
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

  useEffect(() => {
    getAllBK();
  }, []);

  useEffect(() => {
    getCPL();
  }, [refresh]);

  if (cpl) {
    return (
      <main className='flex flex-col gap-5 w-screen max-w-7xl mx-auto pt-20 bg-[#ffffff] p-5'>
        <p className='ml-2 font-bold text-2xl'>
          Detail Capaian Pembelajaran Lulusan
        </p>
        <div className='flex'>
          <Table className='w-[1000px] table-fixed mb-5'>
            <TableBody>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpl.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Deskripsi</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpl.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Deskripsi Inggris</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpl.deskripsiInggris}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Keterangan</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpl.keterangan}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>PL</strong>
                </TableCell>
                <TableCell className='p-2'>
                  :{" "}
                  {cpl.PL.length > 0
                    ? cpl.PL.map((pl) => pl.kode).join(", ")
                    : " - "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPMK</strong>
                </TableCell>
                <TableCell className='p-2'>
                  :{" "}
                  {cpl.CPMK.length > 0
                    ? cpl.CPMK.map((cpmk) => cpmk.kode).join(", ")
                    : " - "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>BK</strong>
                </TableCell>
                <TableCell className='p-2'>
                  :{" "}
                  {cpl.BK.length > 0
                    ? cpl.BK.map((bk) => bk.kode).join(", ")
                    : " - "}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' disabled={kunciData?.kunci}>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit CPL</DialogTitle>
                <DialogDescription>{cpl.kode}</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-4 py-4'>
                  <div className='items-center gap-4'>
                    <Label htmlFor='deskripsi' className='text-right'>
                      Deskripsi
                    </Label>
                    <Textarea placeholder='Deskripsi' required id="deskripsi" {...form.register("deskripsi")} />
                  </div>

                  <div className='items-center gap-4'>
                    <Label htmlFor='deskripsiInggris' className='text-right'>
                      Deskripsi Inggris
                    </Label>
                    <Textarea placeholder='Materi...' required id="deskripsiInggris" {...form.register("deskripsiInggris")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type='submit'>Simpan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* HEADER */}
        <div className='flex justify-between items-center'>
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
        <div className='flex overflow-x-auto space-x-4 p-2'>
          {filteredBK && filteredBK.length > 0 ? (
            filteredBK.map((bk, index) => (
              <DataCard<BK>
                key={index}
                selected={selected1}
                handleCheck={handleCheck1}
                data={bk}
              />
            ))
          ) : (
            <div className='text-sm'>BK Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateRelation}
          type='button'
          className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
          disabled={kunciData?.kunci}
        >
          Simpan
        </button>
      </main>
    );
  }
}
