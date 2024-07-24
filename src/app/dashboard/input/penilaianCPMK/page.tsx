/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axiosConfig from "../../../../utils/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAccount } from "@/app/contexts/AccountContext";

const formSchema = z.object({
  MK: z.string({ required_error: "Please select MK to display." }),
  CPMK: z.string({ required_error: "Please select CPMK to display." }),
  CPL: z.string({ required_error: "Please select CPL to display." }),
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
    .string({ required_error: "Please select Instrumen to display." })
    .optional(),
  batasNilai: z.string(),
  kriteria: z.array(
    z.object({
      kriteria: z.string({
        required_error: "Please select Kriteria to display.",
      }),
      bobot: z.string(),
    })
  ),
});

export interface MKItem {
  kode: string;
  deskripsi: string;
  CPMK: CPMKItem[];
}

export interface CPMKItem {
  kode: string;
  CPL: CPLItem;
}

export interface CPLItem {
  kode: string;
}

const InputPenilaianCPMK = () => {
  const { toast } = useToast();
  const { accountData } = useAccount();
  const [MK, setMK] = useState<MKItem[]>([]);
  const [selectedMK, setSelectedMK] = useState<MKItem>();
  const [searchMK, setSearchMK] = useState<string>("");
  const [searchCPMK, setSearchCPMK] = useState<string>("");

  const filteredMK = MK.filter((mk) =>
    mk.kode.toLowerCase().includes(searchMK.toLowerCase())
  );
  const filteredCPMK = selectedMK?.CPMK.filter((cpmk) =>
    cpmk.kode.toLowerCase().includes(searchCPMK.toLowerCase())
  );

  const fetchData = async () => {
    try {
      getMK(accountData?.prodiId);
    } catch (error) {
      console.log(error);
    }
  };

  const getMK = async (prodiId: string = "") => {
    try {
      const response = await axiosConfig.get(`api/mk?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const tahapPenilaian = [
    { id: "Perkuliahan", label: "Perkuliahan" },
    { id: "Tengah Semester", label: "Tengah Semester" },
    { id: "Akhir Semester", label: "Akhir Semester" },
    { id: "Project Based Learning", label: "Project Based Learning" },
    { id: "Case Method", label: "Case Method" },
    { id: "Problem Based Learning", label: "Problem Based Learning" },
  ];

  const teknikPenilaian = [
    { id: "Observasi (Praktik)", label: "Observasi (Praktik)" },
    { id: "Unjuk Kerja (Presentasi)", label: "Unjuk Kerja (Presentasi)" },
    { id: "Tes Lisan (Tugas Kelompok)", label: "Tes Lisan (Tugas Kelompok)" },
    { id: "Tes Tulis (UTS)", label: "Tes Tulis (UTS)" },
    { id: "Tes Tulis (UAS)", label: "Tes Tulis (UAS)" },
    { id: "Partisipasi (Quiz)", label: "Partisipasi (Quiz)" },
    { id: "Laporan Hasil Proyek", label: "Laporan Hasil Proyek" },
  ];

  const defaultValues = {
    MK: "",
    CPMK: "",
    CPL: "",
    tahapPenilaian: [],
    teknikPenilaian: [],
    instrumen: "",
    batasNilai: "",
    kriteria: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "kriteria",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>, e: any) => {
    e.stopPropagation();

    if (values.tahapPenilaian.includes("Project Based Learning")) {
      let totalBobot = 0;

      values.kriteria.map((item) => {
        totalBobot += parseFloat(item.bobot);
      });

      if (totalBobot < 50) {
        toast({
          title: "Gagal Submit",
          description: "Total bobot Project Based Learning harus lebih dari 50%",
          variant: "destructive",
        });
        return null;
      }
    }

    const convertKriteria = values.kriteria.map((item) => ({
      ...item,
      bobot: parseFloat(item.bobot),
    }));

    const concat = (data: string[]) => data.join(", ");

    const extractNumber = (str: string) => str.match(/\d+/)?.[0] || "";

    const mkNumber = extractNumber(values.MK);
    const cpmkNumber = extractNumber(values.CPMK);

    const kode = `PCPMK-${mkNumber}-${cpmkNumber}`;

    const data = {
      kode: kode,
      MK: values.MK,
      CPMK: values.CPMK,
      CPL: values.CPL,
      tahapPenilaian: concat(values.tahapPenilaian),
      teknikPenilaian: concat(values.teknikPenilaian),
      instrumen: values.instrumen,
      batasNilai: parseFloat(values.batasNilai),
      kriteria: convertKriteria,
      prodiId: accountData?.prodiId,
    };

    try {
      const response = await axiosConfig.post("api/penilaianCPMK", data);
      if (response.data.status !== 400) {
        toast({
          title: "Berhasil Submit",
          description: String(new Date()),
        });
        form.reset(defaultValues);
        setSearchMK("");
        setSearchCPMK("");
      } else {
        toast({
          title: "Gagal Submit!",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Gagal Submit",
        description: error,
        variant: "destructive",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData().catch((error) => {
      console.error("Error fetching account data:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Trigger useEffect only on initial mount

  useEffect(() => {
    const selectedTeknik = form.watch("teknikPenilaian");
    const newKriteria = selectedTeknik.map((teknik) => ({
      kriteria: teknik,
      bobot: "",
    }));
    form.setValue("kriteria", newKriteria);
  }, [form.watch("teknikPenilaian")]);

  return (
    <section className='flex my-[50px] justify-center items-center'>
      <Card className='w-[1000px]'>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Penilaian CPMK</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='MK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.resetField("CPMK");
                        form.resetField("CPL");
                        setSelectedMK(MK.find((mk) => mk.kode === value));
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih MK' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='text'
                          className='mb-2'
                          value={searchMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchMK(e.target.value)}
                        />
                        {filteredMK.map((item) => (
                          <SelectItem key={item.kode} value={item.kode}>
                            {item.kode} - {item.deskripsi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='CPMK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPMK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.resetField("CPL");
                        const CPMK = selectedMK?.CPMK.find(
                          (cpmk) => cpmk.kode === value
                        );
                        if (CPMK) {
                          form.setValue("CPL", CPMK.CPL.kode);
                        }
                        console.log(form.getValues("CPL"));
                      }}
                      value={field.value}
                      disabled={!selectedMK}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih CPMK' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='text'
                          className='mb-2'
                          value={searchCPMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchCPMK(e.target.value)}
                        />
                        {filteredCPMK?.map((item) => (
                          <SelectItem key={item.kode} value={item.kode}>
                            {item.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>CPL</FormLabel>
                <FormField
                  control={form.control}
                  name='CPL'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='CPL'
                          type='text'
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormMessage />
              </FormItem>

              <div className='space-y-2'>
                <FormLabel>Tahap Penilaian :</FormLabel>
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
                                  ? field.onChange([...field.value, item.id])
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
              </div>

              <div className='space-y-2'>
                <FormLabel>Teknik Penilaian :</FormLabel>
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
                                  ? field.onChange([...field.value, item.id])
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
              </div>

              <FormField
                control={form.control}
                name='instrumen'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Instrumen : </FormLabel>
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
                    <FormLabel>Batas Nilai :</FormLabel>
                    <FormControl>
                      <Input placeholder='Batas Nilai' type='text' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.map((field, index) => (
                <div className='flex items-center gap-5' key={field.id}>
                  <FormField
                    control={form.control}
                    name={`kriteria.${index}.kriteria`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kriteria :</FormLabel>
                        <FormControl>
                          <Input type='text' readOnly {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`kriteria.${index}.bobot`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bobot :</FormLabel>
                        <FormControl>
                          <Input placeholder='Bobot' type='text' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button type='submit'>Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};

export default InputPenilaianCPMK;
