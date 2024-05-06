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
import { useToast } from "@/components/ui/use-toast";
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

export interface PCPMKinterface {
  kode: string;
  CPL: string;
  MK: string;
  CPMK: string;
  tahapPenilaian: string;
  teknikPenilaian: string;
  instrumen: string;
  kriteria: kriteriaItem[];
  batasNilai: number;
  inputNilai: inputNilaiItem[];
}

export interface kriteriaItem {
  bobot: number;
  kriteria: string;
}

export interface inputNilaiItem {
  mahasiswaNim: string;
  nilai: number[];
}

const formSchema = z.object({
  tahapPenilaian: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  teknikPenilaian: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  instrumen: z
    .string({
      required_error: "Please select Instrumen to display.",
    })
    .optional(),
  batasNilai: z.string(),
});

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [PCPMK, setPCPMK] = useState<PCPMKinterface | undefined>();
  const [refresh, setRefresh] = useState<boolean>(false);

  const tahapPenilaian = [
    {
      id: "Perkuliahan",
      label: "Perkuliahan",
    },
    {
      id: "Tengah Semester",
      label: "Tengah Semester",
    },
    {
      id: "Akhir Semester",
      label: "Akhir Semester",
    },
  ] as const;

  const teknikPenilaian = [
    {
      id: "Observasi (Praktik)",
      label: "Observasi (Praktik)",
    },
    {
      id: "Unjuk Kerja (Presentasi)",
      label: "Unjuk Kerja (Presentasi)",
    },
    {
      id: "Tes Lisan (Tugas Kelompok)",
      label: "Tes Lisan (Tugas Kelompok)",
    },
    {
      id: "Tes Tulis (UTS)",
      label: "Tes Tulis (UTS)",
    },
    {
      id: "Tes Tulis (UAS)",
      label: "Tes Tulis (UAS)",
    },
    {
      id: "Partisipasi (Quiz)",
      label: "Partisipasi (Quiz)",
    },
  ] as const;

  const defaultValues = {
    tahapPenilaian: [],
    teknikPenilaian: [],
    instrumen: "",
    batasNilai: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation();

    const concat = (data: string[]) => {
      return data.join(", ");
    };

    const data = {
      tahapPenilaian: concat(values.tahapPenilaian),
      teknikPenilaian: concat(values.teknikPenilaian),
      instrumen: values.instrumen,
      batasNilai: parseFloat(values.batasNilai),
    };

    axiosConfig
      .patch(`api/penilaianCPMK/${kode}`, data)
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
      const response = await axiosConfig.get(`api/penilaianCPMK/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setPCPMK(response.data.data);

      form.reset({
        tahapPenilaian: [],
        teknikPenilaian: [],
        instrumen: response.data.data.instrumen,
        batasNilai: String(response.data.data.batasNilai),
      });
    } catch (error: any) {
      throw error;
    }
  };

  const renderData = () => {
    return PCPMK?.inputNilai.map((mahasiswa, index) => {
      return (
        <TableRow key={index}>
          <TableCell className='w-[10%]'>{mahasiswa.mahasiswaNim}</TableCell>
          {mahasiswa.nilai.map((nilai, index) => (
            <TableCell className='w-[10%]' key={index}>
              {nilai}
            </TableCell>
          ))}
        </TableRow>
      );
    });
  };

  useEffect(() => {
    getPCPMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (PCPMK) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[400px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {PCPMK.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>MK</strong>{" "}
                </TableCell>
                <TableCell>: {PCPMK.MK}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>CPL</strong>{" "}
                </TableCell>
                <TableCell>: {PCPMK.CPL}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>CPMK</strong>{" "}
                </TableCell>
                <TableCell>: {PCPMK.CPMK}</TableCell>
              </TableRow>
              {PCPMK.kriteria.map((kriteria, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <strong>Kriteria {index+1}</strong>{" "}
                  </TableCell>
                  <TableCell>: {kriteria.kriteria}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit MK</DialogTitle>
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
                      name='tahapPenilaian'
                      render={() => (
                        <FormItem>
                          <div className='mb-4'>
                            <FormLabel className='text-base'>
                              Tahap Penilaian :
                            </FormLabel>
                          </div>
                          {tahapPenilaian.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name='tahapPenilaian'
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className='flex flex-row items-start space-x-3 space-y-0'
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className='font-normal'>
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='teknikPenilaian'
                      render={() => (
                        <FormItem>
                          <div className='mb-4'>
                            <FormLabel className='text-base'>
                              Teknik Penilaian :
                            </FormLabel>
                          </div>
                          {teknikPenilaian.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name='teknikPenilaian'
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className='flex flex-row items-start space-x-3 space-y-0'
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className='font-normal'>
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

        <div className=' font-bold text-xl'>Data Nilai Mahasiswa</div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[10%]'>NIM</TableHead>
              {PCPMK.inputNilai.map((nilai, index) => (
                <TableHead className='w-[10%]' key={index}>
                  Kriteria {index + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{renderData()}</TableBody>
        </Table>
      </main>
    );
  }
}
