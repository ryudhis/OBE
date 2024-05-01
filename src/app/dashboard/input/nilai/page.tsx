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
import { useState, useEffect } from "react";

const formSchema = z.object({
  PCPMK: z.string({
    required_error: "Please select PCPMK to display.",
  }),
  mahasiswa: z.string({
    required_error: "Please select Mahasiswa to display.",
  }),
  nilai: z.array(z.string()),
});

export interface PCPMKItem {
  kode: string;
  MK: string;
  kriteria: { kriteria: string; bobot: number }[];
}

export interface MKItem {
  kode: string;
  mahasiswa: mahasiswaItem[];
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
}

const InputNilai = () => {
  const { toast } = useToast();
  const [PCPMK, setPCPMK] = useState<PCPMKItem[]>([]);
  const [MK, setMK] = useState<MKItem[]>([]);
  const [selectedPCPMK, setSelectedPCPMK] = useState<PCPMKItem>();
  const [selectedMK, setSelectedMK] = useState<MKItem>();
  const [searchPCPMK, setSearchPCPMK] = useState<string>("");
  const [searchMahasiswa, setSearchMahasiswa] = useState<string>("");

  const filteredPCPMK = PCPMK.filter((pcpmk) =>
    pcpmk.kode.toLowerCase().includes(searchPCPMK.toLowerCase())
  );

  const filteredMahasiswa = selectedMK?.mahasiswa.filter((mahasiswa) =>
    mahasiswa.nim.toLowerCase().includes(searchMahasiswa.toLowerCase())
  );

  const getPCPMK = async () => {
    try {
      const response = await axiosConfig.get("api/penilaianCPMK");
      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setPCPMK(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

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

  const defaultValues = {
    PCPMK: "",
    mahasiswa: "",
    nilai: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation();

    const convertNilai = values.nilai.map((nilai) => {
      return parseFloat(nilai);
    });

    const data = {
      PCPMKId: values.PCPMK,
      MahasiswaId: values.mahasiswa,
      nilai: convertNilai,
    };

    console.log(data);

    axiosConfig
      .post("api/inputNilai", data)
      .then(function (response) {
        if (response.data.status !== 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "PCPMK dan Mahasiswa Sudah Ada!",
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
    setSearchPCPMK("");
    setSearchMahasiswa("");
  }

  useEffect(() => {
    getPCPMK();
  }, []);

  useEffect(() => {
    getMK();
  }, []);

  return (
    <section className='flex h-screen my-[-120px] justify-center items-center'>
      <Card className='w-[1000px]'>
        <CardHeader>
          <CardTitle>Input </CardTitle>
          <CardDescription>Nilai PCPMK</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='PCPMK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penilaian CPMK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedPCPMK = PCPMK.find(
                          (pcpmk) => pcpmk.kode === value
                        );
                        setSelectedPCPMK(selectedPCPMK);
                        const selectedMK = MK.find(
                          (mk) => mk.kode === selectedPCPMK?.MK
                        );
                        setSelectedMK(selectedMK);
                        form.resetField("mahasiswa");
                        form.resetField("nilai");
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih PCPMK' />
                          ) : (
                            "Pilih PCPMK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='number'
                          className='mb-2'
                          value={searchPCPMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchPCPMK(e.target.value)}
                        />
                        {filteredPCPMK.map((pcpmk, index) => {
                          return (
                            <SelectItem key={index} value={pcpmk.kode}>
                              {pcpmk.kode}
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
                name='mahasiswa'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mahasiswa</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("PCPMK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih Mahasiswa' />
                          ) : (
                            "Pilih Mahasiswa"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='number'
                          className='mb-2'
                          value={searchMahasiswa}
                          placeholder='Cari...'
                          onChange={(e) => setSearchMahasiswa(e.target.value)}
                        />
                        {filteredMahasiswa?.map((mahasiswa, index) => {
                          return (
                            <SelectItem key={index} value={mahasiswa.nim}>
                              {mahasiswa.nama} - {mahasiswa.nim}
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
                name='nilai'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>Nilai : </FormLabel>
                    {selectedPCPMK?.kriteria.map((kriteria, index) => (
                      <div key={index} className='flex items-center space-x-5'>
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
                    ))}
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

export default InputNilai;
