"use client";

import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";

const formSchema = z.object({
  nilai: z.array(z.string()),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { accountData }  = useAccount();
  const [inputNilai, setInputNilai] = useState<
    InputNilai| undefined
  >();
  const [refresh, setRefresh] = useState<boolean>(false);
  const defaultValues = {
    nilai: [],
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const convertNilai = values.nilai.map((nilai) => {
      return parseFloat(nilai);
    });

    const data = {
      nilai: convertNilai,
    };

    axiosConfig
      .patch(`api/inputNilai/${id}`, data)
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

  const getInputNilai = async () => {
    try {
      const response = await axiosConfig.get(`api/inputNilai/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail nilai prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setInputNilai(response.data.data);

        const convertNilai = response.data.data.nilai.map((nilai: number) => {
          return String(nilai);
        });

        form.reset({
          nilai: convertNilai,
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    getInputNilai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (inputNilai) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[300px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Nama</strong>{" "}
                </TableCell>
                <TableCell>: {inputNilai.mahasiswa.nama} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>NIM</strong>{" "}
                </TableCell>
                <TableCell>: {inputNilai.mahasiswa.nim}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>MK</strong>{" "}
                </TableCell>
                <TableCell>: {inputNilai.penilaianCPMK.MK.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Kelas</strong>{" "}
                </TableCell>
                <TableCell>: {inputNilai.kelas.nama}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>PenilaianCPMK</strong>{" "}
                </TableCell>
                <TableCell>: {inputNilai.penilaianCPMK.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Nilai</strong>{" "}
                </TableCell>
                <TableCell>
                  : {inputNilai.nilai.map((nilai) => nilai).join(", ")}
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
                <DialogTitle>Edit Data Nilai</DialogTitle>
                <DialogDescription>
                  {inputNilai.penilaianCPMK.MK.kode}/{inputNilai.kelas.nama}/
                  {inputNilai.penilaianCPMK.kode}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
                >
                  <FormField
                    control={form.control}
                    name='nilai'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-base'>Nilai : </FormLabel>
                        {inputNilai.penilaianCPMK.kriteria.map(
                          (kriteria, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-5'
                            >
                              <FormItem>
                                <FormLabel>{kriteria.kriteria} :</FormLabel>
                                <Input
                                  placeholder='Nilai'
                                  type='number'
                                  required
                                  value={field.value[index] ?? ""}
                                  onChange={(e) => {
                                    const updatedNilaiArray = [...field.value];
                                    updatedNilaiArray[index] = e.target.value;
                                    field.onChange(updatedNilaiArray);
                                  }}
                                />
                              </FormItem>
                            </div>
                          )
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      className='bg-blue-500 hover:bg-blue-600'
                      type='submit'
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    );
  }
}
