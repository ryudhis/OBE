"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";

const formSchema = z.object({
  kode: z.string().min(2).max(50),
  deskripsi: z.string().min(1).max(50),
  deskripsiInggris: z.string().min(1).max(50),
  semester: z.string().min(1).max(50),
  sks: z.string().min(1).max(50),
  batasLulusMahasiswa: z.string().min(1).max(50),
  batasLulusMK: z.string().min(1).max(50),
  KK: z.string().min(1).max(50),
});

export interface mk {
  kode: string;
  deskripsi: string;
  deskripsiInggris: string;
}

export interface kelompokKeahlian {
  id: number;
  nama: string;
}

const MKScreen = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData } = useAccount();
  const [MK, setMK] = useState<mk[]>([]);
  const [KK, setKK] = useState<kelompokKeahlian[]>([]);
  const [prerequisitesMK, setPrerequisitesMK] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
      deskripsiInggris: "",
      sks: "",
      semester: "",
      batasLulusMahasiswa: "0",
      batasLulusMK: "0",
      KK: "",
    },
  });

  const getMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData?.prodiId}`
      );
      if (response.data.status !== 400) {
        setMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const getKK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/kelompokKeahlian?prodi=${accountData?.prodiId}`
      );
      if (response.data.status !== 400) {
        setKK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleCheck = (kode: string) => {
    setPrerequisitesMK((prev) =>
      prev.includes(kode) ? prev.filter((id) => id !== kode) : [...prev, kode]
    );
  };

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: values.kode,
      deskripsi: values.deskripsi,
      deskripsiInggris: values.deskripsiInggris,
      semester: values.semester,
      sks: values.sks,
      batasLulusMahasiswa: parseFloat(values.batasLulusMahasiswa),
      batasLulusMK: parseFloat(values.batasLulusMK),
      KK: values.KK,
      prodiId: accountData?.prodiId,
      prerequisitesMK, // Include selected prerequisites MKs
    };

    axiosConfig
      .post("api/mk", data)
      .then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: data.kode,
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

    form.reset();
    setPrerequisitesMK([]); // Reset the prerequisites MK state after submission
  }

  const filteredMK = MK?.filter((mk) =>
    mk.kode.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    getMK();
    getKK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input MK",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className='flex h-screen justify-center items-center mt-[150px]'>
      <Card className='w-[1000px]'>
        <CardHeader>
          <CardTitle>Input MK</CardTitle>
          <CardDescription>Mata Kuliah</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='kode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode MK</FormLabel>
                    <FormControl>
                      <Input placeholder='Kode' required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deskripsi'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder='Deskripsi' required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deskripsiInggris'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Inggris</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Deskripsi Inggris'
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
                name='KK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelompok Keahlian</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Kelompok Keahlian' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KK.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nama}
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
                name='sks'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKS</FormLabel>
                    <FormControl>
                      <Input placeholder='SKS' required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='semester'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Semester' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"Ganjil"}>Ganjil</SelectItem>
                        <SelectItem value={"Genap"}>Genap</SelectItem>
                        <SelectItem value={"Ganjil/Genap"}>
                          Ganjil/Genap
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <FormLabel>Prerequisite Mata Kuliah</FormLabel>
                {MK.length > 0 ? (
                  <>
                    <div className='flex flex-row items-center mb-5'>
                      <input
                        type='text'
                        className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
                        value={search}
                        placeholder='Cari...'
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className='grid grid-cols-5 gap-4'>
                      {filteredMK.map((data) => (
                        <div
                          key={data.kode}
                          onClick={() => handleCheck(data.kode)}
                          className='p-4 bg-white rounded-lg shadow-sm flex flex-row justify-between items-center cursor-pointer ease-in-out duration-300 hover:shadow-md'
                        >
                          <div>
                            <div className='font-medium text-lg'>
                              {data.kode}
                            </div>
                            <div className='text-sm'>
                              {data.deskripsi.length > 30
                                ? data.deskripsi.slice(0, 28) + "..."
                                : data.deskripsi}
                            </div>
                          </div>
                          <input
                            readOnly
                            checked={prerequisitesMK.includes(data.kode)}
                            type='checkbox'
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='text-center text-xl animate-pulse'>Belum ada MK ...</div>
                )}
              </div>

              <FormField
                control={form.control}
                name='batasLulusMahasiswa'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batas Lulus Mahasiswa</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        max={100}
                        placeholder='Batas Lulus Mahasiswa'
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
                name='batasLulusMK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batas Lulus MK {"(%)"}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        max={100}
                        placeholder='Batas Lulus MK'
                        required
                        {...field}
                      />
                    </FormControl>
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

export default MKScreen;
