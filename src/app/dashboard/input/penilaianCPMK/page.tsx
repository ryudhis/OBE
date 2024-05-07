"use client";

import axiosConfig from "../../../../utils/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState, useEffect } from "react";

const formSchema = z.object({
  kode: z.string(),
  MK: z.string({
    required_error: "Please select MK to display.",
  }),
  CPMK: z.string({
    required_error: "Please select CPMK to display.",
  }),
  CPL: z.string({
    required_error: "Please select CPL to display.",
  }),
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
  CPL: CPLItem[];
}

export interface CPLItem {
  kode: string;
}

const InputPenilaianCPMK = () => {
  const { toast } = useToast();
  const [MK, setMK] = useState<MKItem[]>([]);
  const [selectedMK, setSelectedMK] = useState<MKItem>();
  const [selectedCPMK, setSelectedCPMK] = useState<CPMKItem>();
  const [searchMK, setSearchMK] = useState<string>("");
  const [searchCPMK, setSearchCPMK] = useState<string>("");
  const [searchCPL, setSearchCPL] = useState<string>("");

  const filteredMK = MK.filter((mk) =>
    mk.kode.toLowerCase().includes(searchMK.toLowerCase())
  );

  const filteredCPMK = selectedMK?.CPMK.filter((cpmk) =>
    cpmk.kode.toLowerCase().includes(searchCPMK.toLowerCase())
  );

  const filteredCPL = selectedCPMK?.CPL.filter((cpl) =>
    cpl.kode.toLowerCase().includes(searchCPL.toLowerCase())
  );

  const getMK = async () => {
    try {
      const response = await axiosConfig.get("api/mk");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMK(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

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
    kode: "",
    MK: "",
    CPMK: "",
    CPL: "",
    tahapPenilaian: [],
    teknikPenilaian: [],
    instrumen: "",
    kriteria: [{ kriteria: "", bobot: "" }],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation();

    const convertKriteria = values.kriteria.map((item) => ({
      ...item,
      bobot: parseFloat(item.bobot),
    }));

    const concat = (data: string[]) => {
      return data.join(", ");
    };

    const data = {
      kode: "PCPMK-"+values.kode,
      MK: values.MK,
      CPMK: values.CPMK,
      CPL: values.CPL,
      tahapPenilaian: concat(values.tahapPenilaian),
      teknikPenilaian: concat(values.teknikPenilaian),
      instrumen: values.instrumen,
      batasNilai: parseFloat(values.batasNilai),
      kriteria: convertKriteria,
    };

    axiosConfig
      .post("api/penilaianCPMK", data)
      .then(function (response) {
        if (response.data.status !== 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Kode Sudah Ada!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Submit",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      });
    form.reset(defaultValues);
    setSearchMK("");
    setSearchCPMK("");
    setSearchCPL("");
  }

  useEffect(() => {
    getMK();
  }, []);

  return (
    <section className='flex my-[50px] justify-center items-center'>
      <Card className='w-[1000px]'>
        <CardHeader>
          <CardTitle>Input </CardTitle>
          <CardDescription>Penilaian CPMK</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
                control={form.control}
                name='kode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode : </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='PCPMK-'
                        type='number'
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih MK' />
                          ) : (
                            "Pilih MK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='number'
                          className='mb-2'
                          value={searchMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchMK(e.target.value)}
                        />
                        {filteredMK.map((mk, index) => {
                          return (
                            <SelectItem key={index} value={mk.kode}>
                              {mk.kode}
                            </SelectItem>
                          );
                        })}
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
                        setSelectedCPMK(
                          selectedMK?.CPMK.find((cpmk) => cpmk.kode === value)
                        );
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("MK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih CPMK' />
                          ) : (
                            "Pilih CPMK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='number'
                          className='mb-2'
                          value={searchCPMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchCPMK(e.target.value)}
                        />
                        {filteredCPMK?.map((cpmk, index) => {
                          return (
                            <SelectItem key={index} value={cpmk.kode}>
                              {cpmk.kode}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='CPL'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPL</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("CPMK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih CPL' />
                          ) : (
                            "Pilih CPL"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='number'
                          className='mb-2'
                          value={searchCPL}
                          placeholder='Cari...'
                          onChange={(e) => setSearchCPL(e.target.value)}
                        />
                        {filteredCPL?.map((cpl, index) => {
                          return (
                            <SelectItem key={index} value={cpl.kode}>
                              {cpl.kode}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name='kriteria'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Kriteria : </FormLabel>
                    {field.value.map((_, index) => (
                      <div key={index} className='flex items-center space-x-5'>
                        <FormField
                          control={form.control}
                          name={`kriteria.${index}.kriteria`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kriteria</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                required
                              >
                                <FormControl>
                                  <SelectTrigger className='w-[200px] p-2'>
                                    {field.value ? (
                                      <SelectValue placeholder='Pilih Kriteria' />
                                    ) : (
                                      "Pilih Kriteria"
                                    )}
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='Hasil Praktik'>
                                    Hasil Praktik
                                  </SelectItem>
                                  <SelectItem value='Kualitas Presentasi'>
                                    Kualitas Presentasi
                                  </SelectItem>
                                  <SelectItem value='Ketepatan Jawaban'>
                                    Ketepatan Jawaban
                                  </SelectItem>
                                  <SelectItem value='Ketepatan Jawaban Tes Lisan'>
                                    Ketepatan Jawaban Tes Lisan
                                  </SelectItem>
                                  <SelectItem value='Ketepatan Jawaban Quiz'>
                                    Ketepatan Jawaban Quiz
                                  </SelectItem>
                                  <SelectItem value='Ketepatan Jawaban UTS'>
                                    Ketepatan Jawaban UTS
                                  </SelectItem>
                                  <SelectItem value='Ketepatan Jawaban UAS'>
                                    Ketepatan Jawaban UAS
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`kriteria.${index}.bobot`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bobot</FormLabel>
                              <Input
                                placeholder='Bobot'
                                type='number'
                                required
                                {...field}
                              />
                            </FormItem>
                          )}
                        />
                        {index === field.value.length - 1 && index > 0 && (
                          <Button
                            type='button'
                            onClick={() => {
                              const kriteriaArray = form.getValues("kriteria");
                              kriteriaArray.splice(index, 1);
                              field.onChange(kriteriaArray);
                            }}
                            className='px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md'
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      onClick={() => {
                        const kriteriaArray = form.getValues("kriteria");
                        kriteriaArray.push({ bobot: "", kriteria: "" });
                        field.onChange(kriteriaArray);
                      }}
                      className='px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md'
                    >
                      Tambah Kriteria
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className='bg-blue-500 hover:bg-blue-600' type='submit'>
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};

export default InputPenilaianCPMK;
