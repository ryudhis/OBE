"use client";
import axiosConfig from "../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import SkeletonTable from "@/components/SkeletonTable";
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
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const formTambahKKSchema = z.object({
  nama: z.string().min(1).max(50),
});

const formEditKKSchema = z.object({
  nama: z.string().min(1).max(50),
  ketua: z.string(),
});

export default function ProdiPage() {
  const router = useRouter();
  const { accountData, fetchData } = useAccount();
  const [searchDosen, setSearchDosen] = useState<string>("");
  const [dosen, setDosen] = useState<Account[]>();
  const [filteredDosen, setFilteredDosen] = useState<Account[]>();
  const [prodi, setProdi] = useState<Prodi>();
  const [selectedKaprodi, setSelectedKaprodi] = useState<string>();
  const [selectedKKId, setSelectedKKId] = useState<number>();
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const formTambahKK = useForm<z.infer<typeof formTambahKKSchema>>({
    resolver: zodResolver(formTambahKKSchema),
    defaultValues: {
      nama: "",
    },
  });

  const formEditKK = useForm<z.infer<typeof formEditKKSchema>>({
    resolver: zodResolver(formEditKKSchema),
    defaultValues: {
      nama: "",
      ketua: "",
    },
  });

  const getDosen = async () => {
    try {
      const response = await axiosConfig.get(
        `api/account/getDosen?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
        setDosen(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getProdi = async () => {
    try {
      const response = await axiosConfig.get(
        `api/prodi/${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      if (response.data.data.kode !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Anda tidak memiliki akses untuk page detail prodi ${response.data.data.nama}`,
          variant: "destructive",
        });
      } else {
        setProdi(response.data.data);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const assignKaprodi = async (e: any) => {
    e.preventDefault();

    if (selectedKaprodi) {
      const data = {
        kaprodi: parseInt(selectedKaprodi),
        oldKaprodi: prodi?.kaprodi?.id,
      };

      axiosConfig
        .patch(`api/prodi/kaprodi/${accountData?.prodiId}`, data)
        .then(function (response) {
          if (response.data.status != 400) {
            setRefresh(!refresh);
            toast({
              title: "Berhasil Menetapkan Kaprodi",
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
        })
        .finally(function () {
          setSelectedKaprodi("");
          setRefresh(!refresh);
          fetchData();
        });
    }
  };

  const handleAssignKaprodi = async (e: any) => {
    e.stopPropagation();

    try {
      const result = await Swal.fire({
        title: "Tunggu !..",
        text: `Kamu yakin ingin menetapkan Kaprodi baru?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#0F172A",
      });

      if (result.isConfirmed) {
        assignKaprodi(e);
      }
    } catch (error) {
      throw error;
    }
  };

  const tambahKK = async (values: any) => {
    const data = {
      nama: values.nama,
      prodiId: accountData?.prodiId,
    };

    axiosConfig
      .post(`api/kelompokKeahlian`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          setRefresh(!refresh);
          toast({
            title: "Berhasil Menambah Kelompok Keahlian",
            description: `${values.nama}`,
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Menambah KK",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(function () {
        setRefresh(!refresh);
      });
  };

  const handleEditKK = (item: KelompokKeahlian) => {
    setSelectedKKId(item.id);
    formEditKK.setValue("nama", item.nama);
    formEditKK.setValue("ketua", item.ketua ? String(item.ketua.id) : "");
  };

  const editKK = async (values: any) => {
    const data = {
      nama: values.nama,
      ketua: parseInt(values.ketua),
    };

    axiosConfig
      .patch(`api/kelompokKeahlian/${selectedKKId}`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          setRefresh(!refresh);
          toast({
            title: "Berhasil Edit Kelompok Keahlian",
            description: `${values.nama}`,
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Edit KK",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(function () {
        setRefresh(!refresh);
      });
  };

  const deleteKK = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: "Tunggu !..",
        text: `Kamu yakin ingin menghapus Kelompok Keahlian ini?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Tidak",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#0F172A",
      });

      if (result.isConfirmed) {
        axiosConfig
          .delete(`api/kelompokKeahlian/${id}`)
          .then(function (response) {
            if (response.data.status != 400) {
              setRefresh(!refresh);
              toast({
                title: "Berhasil Hapus Kelompok Keahlian",
                description: String(new Date()),
              });
            }
          })
          .catch(function (error) {
            toast({
              title: "Gagal Hapus KK",
              description: String(new Date()),
              variant: "destructive",
            });
            console.log(error);
          })
          .finally(function () {
            setRefresh(!refresh);
          });
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getDosen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getProdi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    if (dosen) {
      setFilteredDosen(
        dosen.filter((item) =>
          item.nama.toLowerCase().includes(searchDosen.toLowerCase())
        )
      );
    }
  }, [searchDosen, dosen]);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page detail prodi",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  if (prodi) {
    return (
      <main className='w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
        <div className='flex'>
          <Table className='w-[400px] mb-5'>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Kode Prodi</strong>
                </TableCell>
                <TableCell>: {prodi.kode} </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Nama Prodi</strong>{" "}
                </TableCell>
                <TableCell>: {prodi.nama}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Kaprodi</strong>{" "}
                </TableCell>
                <TableCell>
                  : {prodi.kaprodi ? prodi.kaprodi.nama : "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Jumlah Tendik</strong>{" "}
                </TableCell>
                <TableCell>: {prodi.tendik.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Jumlah Mahasiswa</strong>{" "}
                </TableCell>
                <TableCell>: {prodi.mahasiswa.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Jumlah MK</strong>{" "}
                </TableCell>
                <TableCell>: {prodi.MK.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Ubah Kaprodi</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[400px]'>
              <DialogHeader>
                <DialogTitle>Pilih Dosen Sebagai Kaprodi</DialogTitle>
                <DialogDescription>Prodi {prodi.nama}</DialogDescription>
              </DialogHeader>
              <div className='flex gap-3 flex-col'>
                <Label htmlFor='deskripsi'>Dosen</Label>
                <Select
                  onValueChange={(e) => {
                    setSelectedKaprodi(e);
                  }}
                  value={selectedKaprodi}
                >
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Pilih Dosen' />
                  </SelectTrigger>
                  <SelectContent>
                    <Input
                      type='text'
                      className='mb-2'
                      value={searchDosen}
                      placeholder='Cari...'
                      onChange={(e) => setSearchDosen(e.target.value)}
                    />
                    {filteredDosen?.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAssignKaprodi} type='submit'>
                    Simpan
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className='w-[1000px] mx-auto'>
          <CardHeader className='flex flex-row justify-between items-center'>
            <div className='flex flex-col'>
              <CardTitle>Kelompok Keahlian</CardTitle>
              <CardDescription>Prodi {prodi.nama}</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline'>Tambah KK</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                  <DialogTitle>Tambah Kelompok Keahlian</DialogTitle>
                  <DialogDescription>Prodi {prodi.nama}</DialogDescription>
                </DialogHeader>
                <Form {...formTambahKK}>
                  <form
                    onSubmit={formTambahKK.handleSubmit(tambahKK)}
                    className='space-y-8'
                  >
                    <FormField
                      control={formTambahKK.control}
                      name='nama'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama</FormLabel>
                          <FormControl>
                            <Input
                              type='nama'
                              min={1}
                              max={50}
                              placeholder='Nama Kelompok Keahlian'
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          className='bg-blue-500 hover:bg-blue-600'
                          type='submit'
                        >
                          Submit
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {!prodi ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[8%]'>No</TableHead>
                    <TableHead className='w-[8%]'>Nama</TableHead>
                    <TableHead className='w-[8%]'>Ketua KK</TableHead>
                    <TableHead className='w-[8%]'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SkeletonTable rows={5} cols={4} />
                </TableBody>
              </Table>
            ) : prodi.KK.length === 0 ? (
              <p className='text-center animate-pulse'>
                Belum ada Kelompok Keahlian
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[8%]'>No</TableHead>
                    <TableHead className='w-[8%]'>Nama</TableHead>
                    <TableHead className='w-[8%]'>Ketua KK</TableHead>
                    <TableHead className='w-[8%]'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prodi.KK.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>
                        {item.ketua ? item.ketua.nama : "-"}
                      </TableCell>
                      <TableCell className="space-x-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => handleEditKK(item)}>
                              Edit KK
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[400px]'>
                            <DialogHeader>
                              <DialogTitle>Edit Kelompok Keahlian</DialogTitle>
                              <DialogDescription>{item.nama}</DialogDescription>
                            </DialogHeader>
                            <Form {...formEditKK}>
                              <form
                                onSubmit={formEditKK.handleSubmit(editKK)}
                                className='space-y-8'
                              >
                                <FormField
                                  control={formEditKK.control}
                                  name='nama'
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nama</FormLabel>
                                      <FormControl>
                                        <Input
                                          type='nama'
                                          min={1}
                                          max={50}
                                          placeholder='Nama Kelompok Keahlian'
                                          required
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={formEditKK.control}
                                  name='ketua'
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Ketua Kelompok Keahlian
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder='Pilih Dosen' />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <Input
                                            type='text'
                                            className='mb-2'
                                            value={searchDosen}
                                            placeholder='Cari...'
                                            onChange={(e) =>
                                              setSearchDosen(e.target.value)
                                            }
                                          />
                                          {filteredDosen?.map((item) => (
                                            <SelectItem
                                              key={item.id}
                                              value={String(item.id)}
                                            >
                                              {item.nama}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button
                                      className='bg-blue-500 hover:bg-blue-600'
                                      type='submit'
                                    >
                                      Submit
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant='destructive'
                          onClick={() => {
                            deleteKK(item.id);
                          }}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }
}
