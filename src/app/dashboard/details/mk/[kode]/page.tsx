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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface MKinterface {
  kode: string;
  deskripsi: string;
  sks: string;
  batasLulusMahasiswa: number;
  BK: BKItem[];
  CPMK: CPMKItem[];
  kelas: KelasItem[];
  penilaianCPMK: penilaianCPMKItem[];
  rencanaPembelajaran: rpItem[];
}

export interface rpItem {
  id: number;
  minggu: string;
  materi: string;
  metode: string;
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

export interface penilaianCPMKItem {
  kode: string;
  inputNilai: inputNilaiItem[];
  kriteria: kriteriaItem[];
  CPMK: CPMKItem;
  CPMKkode: string;
  batasNilai: number;
}

export interface inputNilaiItem {
  id: number;
  penilaianCPMK: penilaianCPMKItem[];
  mahasiswaNim: string;
  nilai: number[];
  kelasId: number;
}

export interface kriteriaItem {
  kriteria: string;
  bobot: number;
}

const formSchema = z.object({
  deskripsi: z.string(),
  sks: z.string(),
  batasLulusMahasiswa: z.string(),
  batasLulusMK: z.string(),
  jumlahKelas: z.string(),
  minggu: z.string(),
  materi: z.string(),
  metode: z.string(),
  editMinggu: z.string(),
  editMateri: z.string(),
  editMetode: z.string(),
});

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [mk, setMK] = useState<MKinterface | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedRencana, setSelectedRencana] = useState<rpItem | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deskripsi: "",
      sks: "",
      batasLulusMahasiswa: "",
      batasLulusMK: "",
      jumlahKelas: "",
      minggu: "",
      materi: "",
      metode: "",
      editMinggu: "",
      editMateri: "",
      editMetode: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      deskripsi: values.deskripsi,
      sks: values.sks,
      batasLulusMahasiswa: parseFloat(values.batasLulusMahasiswa),
      batasLulusMK: parseFloat(values.batasLulusMK),
    };

    axiosConfig
      .patch(`api/mk/${kode}`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
          setRefresh(!refresh);
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
  }

  function onSubmitRP(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      minggu: parseInt(values.minggu),
      materi: values.materi,
      metode: values.metode,
      MKId: mk?.kode,
    };

    axiosConfig
      .post(`api/rencanaPembelajaran/`, data)
      .then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
          setRefresh(!refresh);
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
      console.log(response.data.data);
      form.setValue("deskripsi", response.data.data.deskripsi);
      form.setValue("sks", response.data.data.sks);
      form.setValue(
        "batasLulusMahasiswa",
        String(response.data.data.batasLulusMahasiswa)
      );
      form.setValue("batasLulusMK", String(response.data.data.batasLulusMK));
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

  const delRencana = (id: number) => {
    axiosConfig
      .delete(`api/rencanaPembelajaran/${id}`)
      .then(function (response) {
        if (response.status === 200) {
          toast({
            title: "Berhasil hapus rencana pembelajaran",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Tidak ada rencana pembelajaran!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal hapus rencana pembelajaran",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  };

  function editRencana(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      minggu: parseInt(values.editMinggu),
      materi: values.editMateri,
      metode: values.editMetode,
    };

    axiosConfig
      .patch(`api/rencanaPembelajaran/${selectedRencana?.id}`, data)
      .then(function (response) {
        if (response.status === 200) {
          toast({
            title: "Berhasil edit rencana pembelajaran",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Tidak ada rencana pembelajaran!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal edit rencana pembelajaran",
          description: String(new Date()),
          variant: "destructive",
        });
        console.log(error);
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  }

  const handleSelectRP = (id: number) => {
    const rencana = mk?.rencanaPembelajaran.find(
      (rencana) => rencana.id === id
    );

    if (rencana) {
      form.setValue("editMinggu", String(rencana.minggu));
      form.setValue("editMateri", rencana.materi);
      form.setValue("editMetode", rencana.metode);
      setSelectedRencana(rencana);
    }
  };

  useEffect(() => {
    getMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const renderData = () => {
    return mk?.kelas.map((kelas) => {
      return (
        <TableRow key={kelas.id}>
          <TableCell className="w-[8%]">{kelas.nama}</TableCell>
          <TableCell className="w-[8%]">
            {kelas.mahasiswa ? kelas.mahasiswa.length : 0}
          </TableCell>
          <TableCell className="w-[8%]">{kelas.jumlahLulus}</TableCell>
          <TableCell className="w-[8%]">
            {kelas.MK.batasLulusMahasiswa}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button variant="destructive" onClick={() => delKelas(kelas.id)}>
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

  const renderDataRP = () => {
    return mk?.rencanaPembelajaran.map((rencana) => {
      return (
        <TableRow key={rencana.id}>
          <TableCell className="text-center">{rencana.minggu}</TableCell>
          <TableCell className="text-center">{rencana.materi}</TableCell>
          <TableCell className="text-center">{rencana.metode}</TableCell>
          <TableCell className="text-center flex gap-3">
            <Button
              variant="destructive"
              onClick={() => delRencana(rencana.id)}
            >
              Hapus
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleSelectRP(rencana.id)}
                  variant="outline"
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Data</DialogTitle>
                  <DialogDescription>Rencana Pembelajaran</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(editRencana)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="editMinggu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minggu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              placeholder="Minggu ke-"
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
                      name="editMateri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materi</FormLabel>
                          <FormControl>
                            <Input placeholder="Materi" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editMetode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metode</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {field.value ? (
                                  <SelectValue placeholder="Pilih Metode" />
                                ) : (
                                  "Pilih Metode"
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={"Project Based Learning"}>
                                Project Based Learning
                              </SelectItem>
                              <SelectItem value={"Case Based Learning"}>
                                Case Based Learning
                              </SelectItem>
                              <SelectItem value={"Problem Saved Learning"}>
                                Problem Saved Learning
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        type="submit"
                      >
                        Submit
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderDataAsesment = () => {
    if (!mk) return null;

    const kriteriaMap = new Map<
      string,
      { bobot: number[]; totalBobot: number }
    >();

    mk.penilaianCPMK.forEach((CPMK) => {
      CPMK.kriteria.forEach((kriteria) => {
        if (!kriteriaMap.has(kriteria.kriteria)) {
          kriteriaMap.set(kriteria.kriteria, { bobot: [], totalBobot: 0 });
        }
        const kriteriaData = kriteriaMap.get(kriteria.kriteria);
        kriteriaData?.bobot.push(kriteria.bobot);
        kriteriaData!.totalBobot += kriteria.bobot;
      });
    });

    const kriteriaArray = Array.from(kriteriaMap.entries());

    return kriteriaArray.map(([kriteriaName, kriteriaData], index) => (
      <TableRow key={kriteriaName}>
        <TableCell className="w-[8%]">{index + 1}</TableCell>
        <TableCell className="w-[16%]">{kriteriaName}</TableCell>
        {mk.penilaianCPMK.map((CPMK) => (
          <React.Fragment key={CPMK.CPMKkode}>
            {CPMK.kriteria.some((k) => k.kriteria === kriteriaName) ? (
              <TableCell className="w-[8%] text-center">
                {CPMK.kriteria.find((k) => k.kriteria === kriteriaName)
                  ?.bobot || "-"}
              </TableCell>
            ) : (
              <TableCell className="w-[8%] text-center">-</TableCell>
            )}
          </React.Fragment>
        ))}
        <TableCell className="w-[8%] text-center">
          {kriteriaData.totalBobot}
        </TableCell>
      </TableRow>
    ));
  };

  if (mk) {
    return (
      <main className="w-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5">
        <div className="flex">
          <Table className="w-[400px] mb-5">
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
              <Button variant="outline">Edit Data</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit MK</DialogTitle>
                <DialogDescription>{mk.kode}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="deskripsi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input placeholder="Deskripsi" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKS</FormLabel>
                        <FormControl>
                          <Input placeholder="SKS" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batasLulusMahasiswa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batas Lulus Mahasiswa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Batas Lulus Mahasiswa"
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
                    name="batasLulusMK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batas Lulus MK {"(%)"}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Batas Lulus MK"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-5">
          <div className=" font-bold text-xl">Data Relasi BK</div>
          <RelationData data={mk.BK} jenisData="BK" />
        </div>

        <div className="mb-5">
          <div className=" font-bold text-xl">Data Relasi CPMK</div>
          <RelationData data={mk.CPMK} jenisData="CPMK" />
        </div>

        <Tabs defaultValue="kelas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kelas">Data Kelas</TabsTrigger>
            <TabsTrigger value="rencana">Rencana Pembelajaran</TabsTrigger>
            <TabsTrigger value="asesment">
              Rencana Asesment dan Evaluasi
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kelas">
            {mk.kelas.length != 0 ? (
              <Card className="w-[1000px] mx-auto">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div className="flex flex-col">
                    <CardTitle>Tabel Kelas</CardTitle>
                    <CardDescription>Kelas {mk.deskripsi}</CardDescription>
                  </div>
                  <Button
                    variant="destructive"
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
                          <TableHead className="w-[8%]">Nama</TableHead>
                          <TableHead className="w-[8%]">
                            Jumlah Mahasiswa
                          </TableHead>
                          <TableHead className="w-[8%]">Jumlah Lulus</TableHead>
                          <TableHead className="w-[8%]">Batas Lulus</TableHead>
                          <TableHead className="w-[8%]">Aksi</TableHead>
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
                          <TableHead className="w-[8%]">Nama</TableHead>
                          <TableHead className="w-[8%]">
                            Jumlah Mahasiswa
                          </TableHead>
                          <TableHead className="w-[8%]">Jumlah Lulus</TableHead>
                          <TableHead className="w-[8%]">Batas Lulus</TableHead>
                          <TableHead className="w-[8%]">Aksi</TableHead>
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
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="jumlahKelas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tambah Jumlah Kelas</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              {field.value ? (
                                <SelectValue placeholder="Pilih Jumlah Kelas" />
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

                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    type="submit"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
          <TabsContent className="flex flex-col gap-3" value="rencana">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-[200px] self-end mr-32" variant="outline">
                  Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Data</DialogTitle>
                  <DialogDescription>Rencana Pembelajaran</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitRP)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="minggu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minggu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              placeholder="Minggu ke-"
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
                      name="materi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materi</FormLabel>
                          <FormControl>
                            <Input placeholder="Materi" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metode</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {field.value ? (
                                  <SelectValue placeholder="Pilih Metode" />
                                ) : (
                                  "Pilih Metode"
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={"Project Based Learning"}>
                                Project Based Learning
                              </SelectItem>
                              <SelectItem value={"Case Based Learning"}>
                                Case Based Learning
                              </SelectItem>
                              <SelectItem value={"Problem Saved Learning"}>
                                Problem Saved Learning
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        type="submit"
                      >
                        Submit
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {mk.rencanaPembelajaran.length != 0 ? (
              <Card className="w-[1000px] mx-auto">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div className="flex flex-col">
                    <CardTitle>Rencana Pembelajaran</CardTitle>
                    <CardDescription>Kelas {mk.deskripsi}</CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDeleteAllKelas();
                    }}
                  >
                    Hapus Semua Data
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Minggu</TableHead>
                          <TableHead className="text-center">Materi</TableHead>
                          <TableHead className="text-center">Metode</TableHead>
                          <TableHead className="w-[5%] text-center">
                            Aksi
                          </TableHead>
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
                          <TableHead className="text-center">Minggu</TableHead>
                          <TableHead className="text-center">Materi</TableHead>
                          <TableHead className="text-center">Metode</TableHead>
                          <TableHead className="w-[5%] text-center">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{renderDataRP()}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ) : (
              <p className="self-center">Belum Ada Rencana Pembelajaran ...</p>
            )}
          </TabsContent>
          <TabsContent value="asesment">
            <Card className="w-[1000px] mx-auto">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <CardTitle>Rencana Asesment dan Evaluasi</CardTitle>
                  <CardDescription>Kelas {mk.deskripsi}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {" "}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[8%]">No</TableHead>
                      <TableHead className="w-[16%]">
                        Rencana Evaluasi
                      </TableHead>
                      {mk.penilaianCPMK.map((CPMK) => (
                        <TableHead
                          key={CPMK.CPMKkode}
                          className="w-[8%] text-center"
                        >
                          {`CPMK ${CPMK.CPMKkode}`}
                        </TableHead>
                      ))}
                      <TableHead className="w-[8%]  text-center">
                        Total Bobot
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderDataAsesment()}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    );
  }
}
