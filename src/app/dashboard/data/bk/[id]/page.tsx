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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  deskripsi: z.string().min(1),
  min: z.string().min(0).max(10),
  max: z.string().min(0).max(10),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { accountData } = useAccount();
  const [bk, setBk] = useState<BK | undefined>();
  const [mk, setMk] = useState<MK[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail BK prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setBk(response.data.data);
        const prevSelected = response.data.data.MK.map((item: MK) => item.kode);

        setSelected(prevSelected);
        setPrevSelected(prevSelected);

        form.reset({
          deskripsi: response.data.data.deskripsi,
          min: String(response.data.data.min),
          max: String(response.data.data.max),
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getAllMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}&limit=99999`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMk(response.data.data);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    getAllMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    getBK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (bk) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 p-5'>
        <p className='ml-2 font-bold text-2xl'>Detail Bahan Kajian</p>
        <div className='flex'>
          <Table className='w-[1000px] table-fixed mb-5'>
            <TableBody>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell className='p-2'>: {bk.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Deskripsi</strong>
                </TableCell>
                <TableCell className='p-2'>: {bk.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPL</strong>
                </TableCell>
                <TableCell className='p-2'>
                  : {bk.CPL.length > 0 ? bk.CPL.map((cpl) => cpl.kode).join(", "): " - " }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Mata Kuliah</strong>
                </TableCell>
                <TableCell className='p-2'>
                  : {bk.MK.length > 0 ? bk.MK.map((mk) => mk.kode).join(", "): " - "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Minimal MK</strong>
                </TableCell>
                <TableCell className='p-2'>: {bk.min}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Maksimal MK</strong>
                </TableCell>
                <TableCell className='p-2'>: {bk.max}</TableCell>
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
                  <div className='grid grid-cols-4 items-center  gap-4'>
                    <Label htmlFor='deskripsi' className='text-right'>
                      Deskripsi
                    </Label>
                    <Textarea className="col-span-3" placeholder='Materi...' required id="deskripsi" {...form.register("deskripsi")} />
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

        {/* HEADER */}
        <div className='flex flex-row justify-between items-center'>
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
        <div className='flex overflow-x-auto space-x-4 p-2'>
          {filteredMK && filteredMK.length > 0 ? (
            filteredMK?.map((mk, index) => {
              return (
                <DataCard<MK>
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
