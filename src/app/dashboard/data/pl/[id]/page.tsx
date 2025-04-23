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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  deskripsi: z.string().min(1),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { accountData } = useAccount();
  const [pl, setPl] = useState<PL | undefined>();
  const [cpl, setCPL] = useState<CPL[] | undefined>([]);
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
      .patch(`api/pl/${id}`, data)
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

  const filteredCPL = cpl?.filter((cpl) =>
    cpl.kode.toLowerCase().includes(search.toLowerCase())
  );

  const getPL = async () => {
    try {
      const response = await axiosConfig.get(`api/pl/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail PL prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setPl(response.data.data);
        const prevSelected = response.data.data.CPL.map(
          (item: CPL) => item.kode
        );

        setSelected(prevSelected);
        setPrevSelected(prevSelected);

        form.reset({
          deskripsi: response.data.data.deskripsi,
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getAllCPL = async (prodiId: string | undefined) => {
    try {
      const response = await axiosConfig.get(`api/cpl?prodi=${prodiId}&limit=99999`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPL(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCheck = (kode: string) => {
    setSelected((prevSelected) => {
      if (!prevSelected.includes(kode)) {
        return [...prevSelected, kode];
      } else {
        return prevSelected.filter((item) => item !== kode);
      }
    });
  };

  const updateCPL = async () => {
    let addedCPLId: string[] = [];
    let removedCPLId: string[] = [];

    addedCPLId = selected.filter((item) => !prevSelected.includes(item));
    removedCPLId = prevSelected.filter((item) => !selected.includes(item));

    const payload = {
      kode: pl?.kode,
      deskripsi: pl?.deskripsi,
      addedCPLId: addedCPLId,
      removedCPLId: removedCPLId,
      prodiId: accountData?.prodiId,
    };

    try {
      const response = await axiosConfig.patch(`api/pl/relasi/${id}`, payload);

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
  };

  // ONLY FIRST TIME
  useEffect(() => {
    getAllCPL(accountData?.prodiId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Trigger useEffect only on initial mount

  useEffect(() => {
    getPL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page detail PL prodi .",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  if (pl) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <p className='ml-2 font-bold text-2xl'>Detail Profil Lulusan</p>
        <div className='flex'>
          <Table className='w-[1000px] table-fixed mb-5'>
            <TableBody>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell className='p-2'>: {pl.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Deskripsi</strong>
                </TableCell>
                <TableCell className='p-2'>: {pl.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPL</strong>
                </TableCell>
                <TableCell className='p-2'>
                  : {pl.CPL.map((cpl) => cpl.kode).join(", ")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit PL</DialogTitle>
                <DialogDescription>{pl.kode}</DialogDescription>
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
          <div className=' font-bold text-xl'>Sambungkan CPL</div>
          <input
            type='text'
            className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
            value={search}
            placeholder='Cari...'
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST OF CPL */}
        <div className='flex overflow-x-auto space-x-4 p-2'>
          {filteredCPL && filteredCPL.length > 0 ? (
            filteredCPL?.map((cpl, index) => {
              return (
                <DataCard<CPL>
                  key={index}
                  selected={selected}
                  handleCheck={handleCheck}
                  data={cpl}
                />
              );
            })
          ) : (
            <div className='text-sm'>CPL Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateCPL}
          type='button'
          className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600'
        >
          Simpan
        </button>
      </main>
    );
  }
}
