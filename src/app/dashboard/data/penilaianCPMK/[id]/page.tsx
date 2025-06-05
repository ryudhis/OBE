"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "@/app/contexts/AccountContext";
import { useKunci } from "@/app/contexts/KunciContext";
import { useRouter, useParams } from "next/navigation";

const formSchema = z.object({
  instrumen: z
    .string({
      required_error: "Please select Instrumen to display.",
    })
    .optional(),
  batasNilai: z.string(),
});

export default function Page() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { accountData } = useAccount();
  const { kunciSistem } = useKunci();
  const [PCPMK, setPCPMK] = useState<PenilaianCPMK | undefined>();
  const [refresh, setRefresh] = useState<boolean>(false);

  const defaultValues = {
    instrumen: "",
    batasNilai: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation();

    const data = {
      instrumen: values.instrumen,
      batasNilai: parseFloat(values.batasNilai),
    };

    axiosConfig
      .patch(`api/penilaianCPMK/${id}`, data)
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

  const getPCPMK = async () => {
    try {
      const response = await axiosConfig.get(`api/penilaianCPMK/${id}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Kamu Tidak Memiliki Akses Ke Halaman Detail PCPMK Prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setPCPMK(response.data.data);

        form.reset({
          instrumen: response.data.data.instrumen,
          batasNilai: String(response.data.data.batasNilai),
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  useEffect(() => {
    getPCPMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (PCPMK) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <p className='ml-2 font-bold text-2xl'>Detail Penilaian CPMK</p>
        <div className='flex'>
          <Table className='w-[1000px] table-fixed mb-5'>
            <TableBody>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell className='p-2'>: {PCPMK.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>MK</strong>
                </TableCell>
                <TableCell className='p-2'>: {PCPMK.MKkode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPL</strong>
                </TableCell>
                <TableCell className='p-2'>: {PCPMK.CPL.kode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='w-[20%] p-2'>
                  <strong>CPMK</strong>
                </TableCell>
                <TableCell className='p-2'>: {PCPMK.CPMK.kode}</TableCell>
              </TableRow>
              {PCPMK.kriteria.map((kriteria, index) => (
                <TableRow key={index}>
                  <TableCell className='w-[20%] p-2'>
                    <strong>Kriteria {index + 1}</strong>
                  </TableCell>
                  <TableCell className='p-2'>: {kriteria.kriteria}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' disabled={kunciSistem?.data}>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit PCPMK</DialogTitle>
                <DialogDescription>{PCPMK.kode}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
                >
                  <div className='grid gap-4 py-4'>
                    <FormField
                      control={form.control}
                      name='instrumen'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base'>
                            Instrumen :{" "}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            required
                          >
                            <FormControl>
                              <SelectTrigger>
                                {field.value ? (
                                  <SelectValue placeholder='Pilih Instrumen' />
                                ) : (
                                  "Pilih Instrumen"
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='Rubrik'>Rubrik</SelectItem>
                              <SelectItem value='Panduan Proyek Akhir'>
                                Panduan Proyek Akhir
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='batasNilai'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batas Nilai : </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Batas Nilai'
                              type='number'
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type='submit'>Simpan</Button>
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
