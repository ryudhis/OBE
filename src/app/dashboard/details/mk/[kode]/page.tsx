"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import { toast } from "@/components/ui/use-toast";
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
import { useAccount } from "@/app/contexts/AccountContext";
import { tahunAjaran } from "@/app/dashboard/data/tahunAjaran/page";
import { DataCard } from "@/components/DataCard";
import Swal from "sweetalert2";
import Image from "next/image";
import logo from "/public/Logo1.png";

export interface MKinterface {
  kode: string;
  deskripsi: string;
  sks: string;
  batasLulusMahasiswa: number;
  batasLulusMK: number;
  BK: BKItem[];
  CPMK: CPMKItem[];
  kelas: KelasItem[];
  penilaianCPMK: penilaianCPMKItem[];
  rencanaPembelajaran: rpItem[];
  lulusMK_CPMK: lulusMK_CPMKItem[];
  semester: string;
}

export interface lulusMK_CPMKItem {
  id: number;
  CPMKId: number;
  tahunAjaranId: number;
  jumlahLulus: number;
}

export interface lulusKelas_CPMKItem {
  id: number;
  CPMKId: number;
  tahunAjaranId: number;
  jumlahLulus: number;
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
  tahunAjaran: tahunAjaranItem;
  lulusCPMK: lulusKelas_CPMKItem[];
}

export interface tahunAjaranItem {
  id: number;
  tahun: string;
  semester: string;
}

export interface CPMKItem {
  id: number;
  kode: string;
  deskripsi: string;
  CPL: CPLItem;
}

export interface CPLItem {
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
  const [tahunAjaran, setTahunAjaran] = useState<tahunAjaran[]>([]);
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedRencana, setSelectedRencana] = useState<rpItem | null>(null);
  const [selectedTahun, setSelectedTahun] = useState("");
  const [cpmk, setCPMK] = useState<CPMKItem[] | undefined>([]);
  const [bk, setBK] = useState<BKItem[] | undefined>([]);
  const [prevSelectedCPMK, setPrevSelectedCPMK] = useState<string[]>([]);
  const [prevSelectedBK, setPrevSelectedBK] = useState<string[]>([]);
  const [searchCPMK, setSearchCPMK] = useState<string>("");
  const [searchBK, setSearchBK] = useState<string>("");
  const [selectedCPMK, setSelectedCPMK] = useState<string[]>([]);
  const [selectedBK, setSelectedBK] = useState<string[]>([]);
  const [selectedRelasi, setSelectedRelasi] = useState<string>("");
  const [listCPL, setListCPL] = useState<CPLItem[]>([]);
  const router = useRouter();

  const filteredCPMK = cpmk?.filter((cpmk) =>
    cpmk.kode.toLowerCase().includes(searchCPMK.toLowerCase())
  );

  const filteredBK = bk?.filter((bk) =>
    bk.kode.toLowerCase().includes(searchBK.toLowerCase())
  );

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
      if (response.data.data.prodiId !== accountData?.prodiId) {
        router.push("/dashboard");
        toast({
          title: `Kamu Tidak Memiliki Akses Ke Halaman Detail MK Prodi ${response.data.data.prodiId}`,
          variant: "destructive",
        });
      } else {
        setMK(response.data.data);

        setListCPL(
          Array.from(
            new Set(response.data.data.CPMK.map((cpmk: CPMKItem) => cpmk.CPL))
          )
        );

        const prevSelectedCPMK = response.data.data.CPMK.map(
          (item: CPMKItem) => item.kode
        );

        const prevSelectedBK = response.data.data.BK.map(
          (item: BKItem) => item.kode
        );

        setSelectedCPMK(prevSelectedCPMK);
        setPrevSelectedCPMK(prevSelectedCPMK);

        setSelectedBK(prevSelectedBK);
        setPrevSelectedBK(prevSelectedBK);

        form.setValue("deskripsi", response.data.data.deskripsi);
        form.setValue("sks", response.data.data.sks);
        form.setValue(
          "batasLulusMahasiswa",
          String(response.data.data.batasLulusMahasiswa)
        );
        form.setValue("batasLulusMK", String(response.data.data.batasLulusMK));
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCPMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/cpmk?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPMK(response.data.data);
      console.log(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const getAllBK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/bk?prodi=${accountData?.prodiId}`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCheckCPMK = (kode: string) => {
    setSelectedCPMK((prevSelectedCPMK) => {
      if (!prevSelectedCPMK.includes(kode)) {
        return [...prevSelectedCPMK, kode];
      } else {
        return prevSelectedCPMK.filter((item) => item !== kode);
      }
    });
  };

  const handleCheckBK = (kode: string) => {
    setSelectedBK((prevSelectedBK) => {
      if (!prevSelectedBK.includes(kode)) {
        return [...prevSelectedBK, kode];
      } else {
        return prevSelectedBK.filter((item) => item !== kode);
      }
    });
  };

  const updateCPMK = async () => {
    let addedCPMKId: string[] = [];
    let removedCPMKId: string[] = [];

    addedCPMKId = selectedCPMK.filter(
      (item) => !prevSelectedCPMK.includes(item)
    );
    removedCPMKId = prevSelectedCPMK.filter(
      (item) => !selectedCPMK.includes(item)
    );

    const payload = {
      ...mk,
      addedCPMKId: addedCPMKId,
      removedCPMKId: removedCPMKId,
      prodiId: accountData?.prodiId,
    };

    try {
      const response = await axiosConfig.patch(
        `api/mk/relasiCPMK/${kode}`,
        payload
      );
      setRefresh(!refresh);
      if (response.data.status == 200 || response.data.status == 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        console.log(response.data);
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const updateBK = async () => {
    let addedBKId: string[] = [];
    let removedBKId: string[] = [];

    addedBKId = selectedBK.filter((item) => !prevSelectedBK.includes(item));
    removedBKId = prevSelectedBK.filter((item) => !selectedBK.includes(item));

    const payload = {
      ...mk,
      addedBKId: addedBKId,
      removedBKId: removedBKId,
      prodiId: accountData?.prodiId,
    };

    try {
      const response = await axiosConfig.patch(
        `api/mk/relasiBK/${kode}`,
        payload
      );
      setRefresh(!refresh);
      if (response.data.status == 200 || response.data.status == 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        console.log(response.data);
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran`);
      if (response.data.status !== 400) {
        setTahunAjaran(response.data.data);
        setSelectedTahun(String(response.data.data[0].id));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  function onSubmitKelas(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      MKId: kode,
      jumlahKelas: values.jumlahKelas,
      tahunAjaranId: parseInt(selectedTahun),
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

  const onDeleteAllKelas = async () => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus semua kelas?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
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
    }
  };

  const delKelas = async (id: number) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin kelas ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
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
    }
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

  const handleTahunChange = (value: string) => {
    setSelectedTahun(value);
  };

  const filteredKelas = mk?.kelas.filter(
    (kelas) => kelas.tahunAjaran.id === parseInt(selectedTahun)
  );

  const generateRPS = async () => {
    if (typeof window !== "undefined") {
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById("RPS");

      if (element) {
        const options = {
          margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number], // Margins in inches
          filename: `RPS_MK_${mk?.kode}.pdf`,
          image: { type: "jpeg", quality: 1.0 }, // Handles image quality if any images are present
          html2canvas: {
            scale: 2, // Scale up for higher resolution of all content
            useCORS: true, // Allow cross-origin images (if any)
            letterRendering: true, // Improves text rendering quality
            scrollY: -window.scrollY, // Correct positioning on scrolled pages
          },
          jsPDF: {
            unit: "in",
            format: "A4",
            orientation: "landscape",
            compressPDF: true, // Compress the PDF for smaller file size
          },
        };

        html2pdf().from(element).set(options).save();
      } else {
        console.error("Element with ID 'RPS' not found.");
      }
    }
  };

  useEffect(() => {
    getMK();
    getTahunAjaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    getAllCPMK();
    getAllBK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Trigger useEffect only on initial mount

  const renderData = () => {
    return filteredKelas?.map((kelas) => {
      return (
        <TableRow key={kelas.id}>
          <TableCell className='w-[8%]'>{kelas.nama}</TableCell>
          <TableCell className='w-[8%]'>
            {kelas.tahunAjaran.tahun} - {kelas.tahunAjaran.semester}
          </TableCell>
          <TableCell className='w-[8%]'>
            {kelas.mahasiswa ? kelas.mahasiswa.length : 0}
          </TableCell>
          <TableCell className='w-[8%]'>{kelas.jumlahLulus}</TableCell>
          {kelas.lulusCPMK
            .filter((lulus) => lulus.tahunAjaranId === parseInt(selectedTahun))
            .map((lulus) => (
              <TableCell key={lulus.CPMKId} className='w-[8%]'>
                {lulus.jumlahLulus ? `${lulus.jumlahLulus.toFixed(2)}%` : "-"}
              </TableCell>
            ))}

          {kelas.lulusCPMK.filter(
            (lulus) => lulus.tahunAjaranId === parseInt(selectedTahun)
          ).length === 0 &&
            mk?.CPMK.map((_, index) => (
              <TableCell key={index} className='w-[8%]'>
                -
              </TableCell>
            ))}

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

  const renderDataRP = () => {
    return mk?.rencanaPembelajaran.map((rencana) => {
      return (
        <TableRow key={rencana.id}>
          <TableCell className='text-center'>{rencana.minggu}</TableCell>
          <TableCell className='text-center'>{rencana.materi}</TableCell>
          <TableCell className='text-center'>{rencana.metode}</TableCell>
          <TableCell className='text  -center flex gap-3'>
            <Button
              variant='destructive'
              onClick={() => delRencana(rencana.id)}
            >
              Hapus
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleSelectRP(rencana.id)}
                  variant='outline'
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Edit Data</DialogTitle>
                  <DialogDescription>Rencana Pembelajaran</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(editRencana)}
                    className='space-y-8'
                  >
                    <FormField
                      control={form.control}
                      name='editMinggu'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minggu</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={12}
                              placeholder='Minggu ke-'
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
                      name='editMateri'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materi</FormLabel>
                          <FormControl>
                            <Input placeholder='Materi' required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='editMetode'
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
                                  <SelectValue placeholder='Pilih Metode' />
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
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderDataPenilaian = () => {
    // Step 1: Gather all unique kriteria
    const allKriteria = Array.from(
      new Set(
        mk?.penilaianCPMK.flatMap((item) =>
          item.kriteria.map((k) => k.kriteria)
        )
      )
    );

    // Step 2: Initialize the totals object
    const kriteriaTotals: { [key: string]: number } = {};
    allKriteria.forEach((kriteria) => {
      kriteriaTotals[kriteria] = 0;
    });
    let totalBobotSum = 0;

    // Step 3: Create table rows with CPMK, corresponding bobot for each kriteria, and total bobot
    const tableData = mk?.penilaianCPMK.map((pcpmk) => {
      const row: { [key: string]: number | string } = { kode: pcpmk.CPMK.kode };

      let totalBobot = 0;

      allKriteria.forEach((kriteria) => {
        const foundKriteria = pcpmk.kriteria.find(
          (k) => k.kriteria === kriteria
        );
        const bobot = foundKriteria ? foundKriteria.bobot : 0;
        row[kriteria] = bobot;
        totalBobot += bobot;

        // Add to kriteriaTotals
        kriteriaTotals[kriteria] += bobot;
      });

      row["totalBobot"] = totalBobot;
      totalBobotSum += totalBobot;

      return row;
    });

    // Step 4: Create the final row for total bobot of each kriteria
    const totalRow: { [key: string]: number | string } = {
      kode: "Total Bobot",
    };
    allKriteria.forEach((kriteria) => {
      totalRow[kriteria] = kriteriaTotals[kriteria];
    });
    totalRow["totalBobot"] = totalBobotSum;

    return (
      <Table>
        <TableHeader>
          <TableRow className='bg-[#CCCCCC]'>
            <TableHead>CPMK Code</TableHead>
            {allKriteria.map((kriteria) => (
              <TableHead key={kriteria}>{kriteria}</TableHead>
            ))}
            <TableHead>Total Bobot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData?.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.kode}</TableCell>
              {allKriteria.map((kriteria) => (
                <TableCell key={kriteria}>{row[kriteria]}</TableCell>
              ))}
              <TableCell>{row.totalBobot}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Total per penilaian</TableCell>
            {allKriteria.map((kriteria) => (
              <TableCell key={kriteria}>{totalRow[kriteria]}</TableCell>
            ))}
            <TableCell>{totalRow.totalBobot}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
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
        <TableCell className='w-[8%] text-center'>{index + 1}</TableCell>
        <TableCell className='w-[16%]'>{kriteriaName}</TableCell>
        {mk.penilaianCPMK.map((CPMK) => (
          <React.Fragment key={CPMK.CPMKkode}>
            {CPMK.kriteria.some((k) => k.kriteria === kriteriaName) ? (
              <TableCell className='w-[8%] text-center'>
                {CPMK.kriteria.find((k) => k.kriteria === kriteriaName)
                  ?.bobot || "-"}
              </TableCell>
            ) : (
              <TableCell className='w-[8%] text-center'>-</TableCell>
            )}
          </React.Fragment>
        ))}
        <TableCell className='w-[8%] text-center'>
          {kriteriaData.totalBobot}
        </TableCell>
      </TableRow>
    ));
  };

  if (mk) {
    return (
      <main className='w-screen max-w-7xl mx-auto pt-20 p-5'>
        <div className='flex gap-3'>
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
              <TableRow>
                <TableCell>
                  <strong>Performa</strong>{" "}
                </TableCell>
                <TableCell>
                  :{" "}
                  {mk.lulusMK_CPMK
                    .filter(
                      (lulusMK) =>
                        lulusMK.tahunAjaranId === parseInt(selectedTahun)
                    )
                    .map(
                      (lulusMK) =>
                        `${cpmk
                          ?.filter((cpmk) => cpmk.id === lulusMK.CPMKId)
                          .map((cpmk) => cpmk.kode)}: ${
                          lulusMK.jumlahLulus
                            ? `${lulusMK.jumlahLulus.toFixed(2)}%`
                            : "-"
                        }`
                    )
                    .join(", ")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>CPMK</strong>{" "}
                </TableCell>
                <TableCell>
                  : {mk.CPMK.map((cpmk) => cpmk.kode).join(", ")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>BK</strong>{" "}
                </TableCell>
                <TableCell>: {mk.BK.map((bk) => bk.kode).join(", ")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Select onValueChange={handleTahunChange} value={selectedTahun}>
            <SelectTrigger className='w-[250px]'>
              <SelectValue placeholder='Tahun Ajaran' />
            </SelectTrigger>
            <SelectContent>
              {tahunAjaran.map((tahun) => (
                <SelectItem key={tahun.id} value={String(tahun.id)}>
                  {tahun.tahun} {tahun.semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Edit Data</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Edit MK</DialogTitle>
                <DialogDescription>{mk.kode}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
                >
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

        <Tabs defaultValue='kelas' className='w-full'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='kelas'>Data Kelas</TabsTrigger>
            <TabsTrigger value='rencana'>Rencana Pembelajaran</TabsTrigger>
            <TabsTrigger value='asesment'>
              Rencana Asesment dan Evaluasi
            </TabsTrigger>
            <TabsTrigger value='rps'>RPS</TabsTrigger>
            <TabsTrigger value='relasi'>Sambungkan CPMK/BK</TabsTrigger>
          </TabsList>
          <TabsContent value='kelas'>
            {filteredKelas?.length != 0 ? (
              <Card className='w-[1000px] mx-auto'>
                <CardHeader className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <CardTitle>Tabel Kelas</CardTitle>
                    <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
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
                          <TableHead className='w-[8%]'>Tahun Ajaran</TableHead>
                          <TableHead className='w-[8%]'>
                            Jumlah Mahasiswa
                          </TableHead>
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
                          <TableHead className='w-[8%]'>Tahun Ajaran</TableHead>
                          <TableHead className='w-[8%]'>
                            Jumlah Mahasiswa
                          </TableHead>
                          <TableHead className='w-[8%]'>Jumlah Lulus</TableHead>
                          {mk.lulusMK_CPMK.map((CPMK) => {
                            return cpmk
                              ?.filter((cpmk) => cpmk.id === CPMK.CPMKId)
                              .map((cpmk) => {
                                return (
                                  <TableHead key={cpmk.id}>
                                    {cpmk.kode}
                                  </TableHead>
                                );
                              });
                          })}
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

                  <Button
                    className='bg-blue-500 hover:bg-blue-600'
                    type='submit'
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
          <TabsContent className='flex flex-col gap-3' value='rencana'>
            <Dialog>
              <DialogTrigger asChild>
                <Button className='w-[200px] self-end mr-32' variant='outline'>
                  Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Tambah Data</DialogTitle>
                  <DialogDescription>Rencana Pembelajaran</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitRP)}
                    className='space-y-8'
                  >
                    <FormField
                      control={form.control}
                      name='minggu'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minggu</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={12}
                              placeholder='Minggu ke-'
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
                      name='materi'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materi</FormLabel>
                          <FormControl>
                            <Input placeholder='Materi' required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='metode'
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
                                  <SelectValue placeholder='Pilih Metode' />
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
                              <SelectItem value={"Problem Based Learning"}>
                                Problem Based Learning
                              </SelectItem>
                              <SelectItem value={"Contextual Learning"}>
                                Contextual Learning
                              </SelectItem>
                              <SelectItem value={"Diskusi"}>Diskusi</SelectItem>
                            </SelectContent>
                          </Select>
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

            {mk.rencanaPembelajaran.length != 0 ? (
              <Card className='w-[1000px] mx-auto'>
                <CardHeader className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <CardTitle>Rencana Pembelajaran</CardTitle>
                    <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                  </div>
                  <Button
                    variant='destructive'
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
                          <TableHead className='text-center'>Minggu</TableHead>
                          <TableHead className='text-center'>Materi</TableHead>
                          <TableHead className='text-center'>Metode</TableHead>
                          <TableHead className='w-[5%] text-center'>
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
                          <TableHead className='text-center'>Minggu</TableHead>
                          <TableHead className='text-center'>Materi</TableHead>
                          <TableHead className='text-center'>Metode</TableHead>
                          <TableHead className='w-[5%] text-center'>
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
              <p className='self-center'>Belum Ada Rencana Pembelajaran ...</p>
            )}
          </TabsContent>

          <TabsContent value='asesment'>
            <Card className='w-[1000px] mx-auto'>
              <CardHeader className='flex flex-row justify-between items-center'>
                <div className='flex flex-col'>
                  <CardTitle>Rencana Asesment dan Evaluasi</CardTitle>
                  <CardDescription>Mata Kuliah {mk.deskripsi}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {" "}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[8%] text-center'>No</TableHead>
                      <TableHead className='w-[16%]'>
                        Rencana Evaluasi
                      </TableHead>
                      {mk.penilaianCPMK.map((CPMK) => (
                        <TableHead
                          key={CPMK.CPMK.kode}
                          className='w-[8%] text-center'
                        >
                          {`${CPMK.CPMK.kode}`}
                        </TableHead>
                      ))}
                      <TableHead className='w-[8%]  text-center'>
                        Total Bobot
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderDataAsesment()}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className='flex flex-col gap-3' value='rps'>
            <Card className='mx-auto'>
              <CardHeader className='flex flex-row justify-between items-center'>
                <div className='flex flex-col'>
                  <CardTitle>Rencana Pembelajaran Semester</CardTitle>
                  <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                </div>

                <div className='flex gap-3'>
                  <Button onClick={generateRPS}>Generate RPS</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table id='RPS'>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={2} className='text-center'>
                        <div className='flex w-full items-center justify-between'>
                          <Image
                            src={logo}
                            alt='LOGO UNIVERSITAS'
                            width={100}
                            height={100}
                          />

                          <div>
                            <h2>RENCANA PEMBELAJARAN SEMESTER</h2>
                            <h3>PROGRAM STUDI S1 TEKNIK INFORMATIKA</h3>
                            <h4>FAKULTAS TEKNOLOGI INDUSTRI</h4>
                            <h5>INSTITUT TEKNOLOGI SUMATERA</h5>
                          </div>

                          <div />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Identitas Mata Kuliah</TableHead>
                      <TableCell>
                        <Table>
                          <TableBody>
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead>NAMA MK</TableHead>
                              <TableHead>KODE MK</TableHead>
                              <TableHead>RUMPUN MATA KULIAH</TableHead>
                              <TableHead>BOBOT (SKS)</TableHead>
                              <TableHead>SEMESTER</TableHead>
                              <TableHead>Direvisi</TableHead>
                            </TableRow>
                            <TableRow>
                              <TableCell>{mk.deskripsi}</TableCell>
                              <TableCell>{mk?.kode}</TableCell>
                              <TableCell>Teknik</TableCell>
                              <TableCell>{mk?.sks}</TableCell>
                              <TableCell>{mk?.semester}</TableCell>
                              <TableCell>11/17/2022</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Otoritas Pengembang RPS</TableHead>
                      <TableCell>
                        <Table>
                          <TableBody>
                            <TableRow className='w-[100%] bg-[#CCCCCC]'>
                              <TableHead>Pengembang RPS</TableHead>
                              <TableHead>Ketua Kelompok Keahlian</TableHead>
                              <TableHead>Ka PRODI</TableHead>
                            </TableRow>

                            <TableRow>
                              <TableCell>[Nama Koordinator Dosen MK]</TableCell>
                              <TableCell>[Nama Ketua KK]</TableCell>
                              <TableCell>[Nama Kepala Program Studi]</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Deskripsi Mata Kuliah</TableHead>
                      <TableCell>
                        <p>
                          Pada mata kuliah ini mahasiswa mempelajari tentang:
                        </p>
                        <ul>
                          <li>
                            Definisi dan model fundamental Analisis Jaringan
                            Sosial
                          </li>
                          <li>
                            Tipe jaringan, struktur, model, dan proses dinamis
                            pada jaringan sosial
                          </li>
                          <li>
                            Metode perhitungan sentralitas jaringan sosial
                          </li>
                          <li>
                            Metode untuk mengidentifikasi komunitas dalam
                            jaringan sosial
                          </li>
                          <li>
                            Perangkat lunak untuk menerapkan analisis jaringan
                            sosial
                          </li>
                          <li>Visualisasi jaringan sosial</li>
                        </ul>
                        <p>
                          Mata kuliah ini menggunakan studi kasus jaringan
                          sosial Twitter.
                        </p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Capaian Pembelajaran</TableHead>
                      <TableCell>
                        <Table>
                          <TableBody>
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead colSpan={3}>
                                Capaian Pembelajaran Lulusan (CPL)
                              </TableHead>
                            </TableRow>
                            {listCPL.map((cpl: CPLItem) => (
                              <TableRow key={cpl.kode}>
                                <TableCell className='w-[15%]'>
                                  {cpl.kode}
                                </TableCell>
                                <TableCell>{cpl.deskripsi}</TableCell>
                              </TableRow>
                            ))}

                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead colSpan={2}>
                                Capaian Pembelajaran Mata Kuliah (CPMK)
                              </TableHead>
                              <TableHead>CPL yang di dukung</TableHead>
                            </TableRow>
                            {mk.CPMK.map((cpmk: CPMKItem) => (
                              <TableRow key={cpmk.kode}>
                                <TableCell className='w-[15%]'>
                                  {cpmk.kode}
                                </TableCell>
                                <TableCell>{cpmk.deskripsi}</TableCell>
                                <TableCell className='w-[20%]'>
                                  {cpmk.CPL.kode}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Penilaian</TableHead>
                      <TableCell>{mk ? renderDataPenilaian() : null}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Pustaka</TableHead>
                      <TableCell>
                        <Table>
                          <TableBody>
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead>Utama:</TableHead>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                [WAS94] Social Network Analysis: Methods and
                                Applications, Stanley Wasserman and Katherine
                                Faust. Cambridge University Press. 1994
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                [MAK11] Social Network Analysis for Start Up,
                                Maksim Tsvetovat and Alexander Kouznetsov.
                                OReilly. 2011
                              </TableCell>
                            </TableRow>
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead>Pendukung:</TableHead>
                            </TableRow>
                            <TableRow>
                              <TableCell>-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Media Pembelajaran</TableHead>
                      <TableCell>
                        <Table>
                          <TableBody>
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead className='w-[70%]'>
                                Software
                              </TableHead>
                              <TableHead className='w-[30%]'>
                                Hardware
                              </TableHead>
                            </TableRow>
                            <TableRow>
                              <TableCell>Gephi; NetworkX, Python</TableCell>
                              <TableCell>Komputer/Laptop; Projector</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Team Teaching</TableHead>
                      <TableCell>
                        <p>[List of Dosen]</p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Matakuliah Syarat</TableHead>
                      <TableCell>
                        <p>[List of Prerequisites]</p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Ambang Batas Kelulusan Mahasiswa</TableHead>
                      <TableCell>{mk?.batasLulusMahasiswa}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Ambang Batas Kelulusan MK</TableHead>
                      <TableCell>{mk?.batasLulusMK}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='relasi'>
            <Card className='w-[1000px] mx-auto'>
              <CardHeader className='flex flex-row justify-between items-center'>
                <div className='flex flex-col'>
                  <CardTitle>Sambungkan CPMK/BK untuk MK {mk.kode}</CardTitle>
                  <CardDescription>
                    Capaian Pembelajaran Mata Kuliah / Bahan Kajian
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* HEADER */}
                <Select
                  value={selectedRelasi}
                  onValueChange={(e) => setSelectedRelasi(e)}
                >
                  <SelectTrigger className='w-[250px] mb-5'>
                    <SelectValue placeholder='Pilih CPMK/BK' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CPMK'>CPMK</SelectItem>
                    <SelectItem value='BK'>BK</SelectItem>
                  </SelectContent>
                </Select>
                {selectedRelasi === "CPMK" ? (
                  <>
                    <div className='flex flex-row items-center mb-5'>
                      <input
                        type='text'
                        className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
                        value={searchCPMK}
                        placeholder='Cari...'
                        onChange={(e) => setSearchCPMK(e.target.value)}
                      />
                    </div>
                    {/* LIST OF MK */}
                    <div className='grid grid-cols-4 gap-4'>
                      {filteredCPMK && filteredCPMK.length > 0 ? (
                        filteredCPMK?.map((cpmk, index) => {
                          return (
                            <DataCard<CPMKItem>
                              key={index}
                              selected={selectedCPMK}
                              handleCheck={handleCheckCPMK}
                              data={cpmk}
                            />
                          );
                        })
                      ) : (
                        <div className='text-sm'>CPMK Tidak Ditemukan</div>
                      )}
                    </div>
                    {/* SAVE */}
                    <button
                      onClick={updateCPMK}
                      type='button'
                      className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600'
                    >
                      Simpan
                    </button>
                  </>
                ) : selectedRelasi === "BK" ? (
                  <>
                    <div className='flex flex-row items-center mb-5'>
                      <input
                        type='text'
                        className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
                        value={searchBK}
                        placeholder='Cari...'
                        onChange={(e) => setSearchBK(e.target.value)}
                      />
                    </div>
                    {/* LIST OF BK */}
                    <div className='grid grid-cols-4 gap-4'>
                      {filteredBK && filteredBK.length > 0 ? (
                        filteredBK?.map((bk, index) => {
                          return (
                            <DataCard<BKItem>
                              key={index}
                              selected={selectedBK}
                              handleCheck={handleCheckBK}
                              data={bk}
                            />
                          );
                        })
                      ) : (
                        <div className='text-sm'>BK Tidak Ditemukan</div>
                      )}
                    </div>
                    {/* SAVE */}
                    <button
                      onClick={updateBK}
                      type='button'
                      className='w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600'
                    >
                      Simpan
                    </button>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    );
  }
}
