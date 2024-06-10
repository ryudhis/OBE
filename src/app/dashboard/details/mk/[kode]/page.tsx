"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { RelationData } from "@/components/RelationData";
import { Button } from "@/components/ui/button";
import SkeletonTable from "@/components/SkeletonTable";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataCard } from "@/components/DataCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export interface MKinterface {
  kode: string;
  deskripsi: string;
  sks: string;
  batasLulusMahasiswa: number;
  BK: BKItem[];
  CPMK: CPMKItem[];
  kelas: KelasItem[];
}

export interface KelasItem {
  id: number;
  nama: string;
  mahasiswa: mahasiswaItem[];
  jumlahLulus: number;
  MK: MKinterface;
}

export interface CPMKItem {
  kode: string;
  deskripsi: string;
}

export interface BKItem {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
}

// export interface transformedData{
//   kode: string;
//   deskripsi: string;
// }

const formSchema = z.object({
  deskripsi: z.string().min(1).max(50),
  jumlahKelas: z.string({
    required_error: "Please select Jumlah Kelas to display.",
  }),
});

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [mk, setMK] = useState<MKinterface | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  // const [mahasiswa, setMahasiswa] = useState<mahasiswaItem[] | undefined>([]);
  // const [prevSelected, setPrevSelected] = useState<string[]>([]);
  // const [selected, setSelected] = useState<string[]>([]);
  // const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
      jumlahKelas: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
    };

    axiosConfig
      .patch(`api/mk/${kode}`, data)
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

  const getMK = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(`api/mk/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMK(response.data.data);

      form.reset({
        deskripsi: response.data.data.deskripsi,
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  function onSubmitKelas(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      MKId: kode,
      jumlahKelas: values.jumlahKelas,
    };

    axiosConfig
      .post("api/kelas", data)
      .then(function (response) {
        if (response.data.status != 400) {
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
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  }

  const onDeleteAllKelas = () => {
    const data = {
      MKId: kode,
    };

    axiosConfig
      .delete("api/kelas", { data })
      .then(function (response) {
        if (response.status === 200) {
          toast({
            title: "Berhasil hapus data",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Tidak ada data!",
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
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  };

  const delKelas = (id: number) => {
    axiosConfig
      .delete(`api/kelas/${id}`)
      .then(function (response) {
        if (response.status === 200) {
          toast({
            title: "Berhasil hapus kelas",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Tidak ada kelas!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal hapus kelas",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  };

  useEffect(() => {
    getMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const renderData = () => {
    return mk?.kelas.map((kelas) => {
      return (
        <TableRow key={kelas.id}>
          <TableCell className='w-[8%]'>{kelas.nama}</TableCell>
          <TableCell className='w-[8%]'>
            {kelas.mahasiswa ? kelas.mahasiswa.length : 0}
          </TableCell>
          <TableCell className='w-[8%]'>{kelas.jumlahLulus}</TableCell>
          <TableCell className='w-[8%]'>
            {kelas.MK.batasLulusMahasiswa}
          </TableCell>
          <TableCell className='w-[8%] flex gap-2'>
            <Button variant='destructive' onClick={() => delKelas(kelas.id)}>
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(
                  `/dashboard/details/mk/${kelas.MK.kode}/kelas/${kelas.id}/`
                );
              }}
            >
              Details
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  if (mk) {
    return (
      <main className='w-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[400px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode</strong>
                </TableCell>
                <TableCell>: {mk.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Deskripsi</strong>{" "}
                </TableCell>
                <TableCell>: {mk.deskripsi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Jumlah SKS</strong>{" "}
                </TableCell>
                <TableCell>: {mk.sks}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit MK</DialogTitle>
                <DialogDescription>{mk.kode}</DialogDescription>
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

        <div className='mb-5'>
          <div className=' font-bold text-xl'>Data Relasi BK</div>
          <RelationData data={mk.BK} jenisData='BK' />
        </div>

        <div className='mb-5'>
          <div className=' font-bold text-xl'>Data Relasi CPMK</div>
          <RelationData data={mk.CPMK} jenisData='CPMK' />
        </div>

        {mk.kelas.length != 0 ? (
          <Card className='w-[1000px] mx-auto'>
            <CardHeader className='flex flex-row justify-between items-center'>
              <div className='flex flex-col'>
                <CardTitle>Tabel Kelas</CardTitle>
                <CardDescription>Kelas {mk.deskripsi}</CardDescription>
              </div>
              <Button
                variant='destructive'
                onClick={() => {
                  onDeleteAllKelas();
                }}
              >
                Hapus Semua Kelas
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[8%]'>Nama</TableHead>
                      <TableHead className='w-[8%]'>Jumlah Mahasiswa</TableHead>
                      <TableHead className='w-[8%]'>Jumlah Lulus</TableHead>
                      <TableHead className='w-[8%]'>Batas Lulus</TableHead>
                      <TableHead className='w-[8%]'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SkeletonTable rows={5} cols={5} />
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[8%]'>Nama</TableHead>
                      <TableHead className='w-[8%]'>Jumlah Mahasiswa</TableHead>
                      <TableHead className='w-[8%]'>Jumlah Lulus</TableHead>
                      <TableHead className='w-[8%]'>Batas Lulus</TableHead>
                      <TableHead className='w-[8%]'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderData()}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitKelas)}
              className='space-y-8'
            >
              <FormField
                control={form.control}
                name='jumlahKelas'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tambah Jumlah Kelas</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih Jumlah Kelas' />
                          ) : (
                            "Pilih Jumlah Kelas"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"1"}>1</SelectItem>
                        <SelectItem value={"2"}>2</SelectItem>
                        <SelectItem value={"3"}>3</SelectItem>
                        <SelectItem value={"4"}>4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className='bg-blue-500 hover:bg-blue-600' type='submit'>
                Submit
              </Button>
            </form>
          </Form>
        )}
      </main>
    );
  }
}
