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
import { useKunci }  from "@/app/contexts/KunciContext";
import { useRouter, useParams } from "next/navigation";

const formSchema = z.object({
  deskripsi: z.string().min(1),
});
export default function Page() {
  const params = useParams();
  const id = params.id;
  const { accountData } = useAccount();
  const { kunciSistem } = useKunci();
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
        `api/mk?prodi=${accountData?.prodiId}&limit=99999`
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
        <p className='ml-2 font-bold text-2xl'>
          Detail Capaian Pembelajaran Mata Kuliah
        </p>
        <div className='flex'>
          <Table className='w-[1000px] table-fixed mb-5'>
            <TableBody>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpmk.kode} </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell className='p-2'>: {cpmk.deskripsi}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPL</strong>
                </TableCell>
                <TableCell className='p-2'>: {cpmk.CPL.kode} </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Mata Kuliah</strong>
                </TableCell>
                <TableCell className='p-2'>
                  :{" "}
                  {cpmk.MK.length > 0
                    ? cpmk.MK.map((mk: MK) => mk.kode).join(", ")
                    : " - "}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' disabled={kunciSistem?.data}>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit PL</DialogTitle>
                <DialogDescription>{cpmk.kode}</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='grid gap-4 py-4'>
                  <div className='flex flex-col gap-4'>
                    <Label htmlFor='deskripsi' className='text-left'>
                      Deskripsi
                    </Label>
                    <Textarea placeholder='Materi...' required id="deskripsi" {...form.register("deskripsi")} />
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
          className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
          disabled={kunciSistem?.data}
        >
          Simpan
        </button>
      </main>
    );
  }
}
