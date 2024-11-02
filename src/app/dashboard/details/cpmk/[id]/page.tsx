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
});
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const { accountData } = useAccount();
  const [cpmk, setCpmk] = useState<CPMK | undefined>();
  const [mk, setMk] = useState<MK[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const filteredMK = mk?.filter((mk) =>
    mk.kode.toLowerCase().includes(search.toLowerCase())
  );

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

    console.log(data);

    axiosConfig
      .patch(`api/cpmk/${id}`, data)
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

  const getCPMK = async () => {
    try {
      const response = await axiosConfig.get(`api/cpmk/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail CPL prodi $${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setCpmk(response.data.data);
        const prevSelected = response.data.data.MK.map((item: MK) => item.kode);

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
  const getAllMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMk(response.data.data);
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

  const updateMK = async () => {
    let addedMKId: string[] = [];
    let removedMKId: string[] = [];

    addedMKId = selected.filter((item) => !prevSelected.includes(item));
    removedMKId = prevSelected.filter((item) => !selected.includes(item));

    const payload = {
      kode: cpmk?.kode,
      deskripsi: cpmk?.deskripsi,
      addedMKId: addedMKId,
      removedMKId: removedMKId,
    };

    console.log(payload);

    try {
      const response = await axiosConfig.patch(
        `api/cpmk/relasi/${id}`,
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
  };

  useEffect(() => {
    getAllMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCPMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (cpmk) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <p className='ml-2 font-bold text-2xl'>Detail Capaian Pembelajaran Mata Kuliah</p>
        <div className='flex'>
          <Table className='w-[200px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {cpmk.kode} </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <strong>CPL</strong>
                </TableCell>
                <TableCell>: {cpmk.CPL.kode} </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell>: {cpmk.deskripsi}</TableCell>
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
                <DialogDescription>{cpmk.kode}</DialogDescription>
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
          <div className=' font-bold text-xl'>Data Relasi MK</div>
          <RelationData data={cpmk.MK} jenisData='MK' />
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
