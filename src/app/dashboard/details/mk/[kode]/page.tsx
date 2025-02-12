/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect, ChangeEvent, use } from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray, set } from "react-hook-form";
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
import { DataCard } from "@/components/DataCard";
import Swal from "sweetalert2";
import Image from "next/image";
import logo from "/public/Logo1.png";

const formSchema = z.object({
  deskripsi: z.string(),
  deskripsiInggris: z.string(),
  sks: z.string(),
  semester: z.string(),
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

const rpsSchema = z.object({
  deskripsi: z.string(),
  pustakaUtama: z.array(
    z.object({
      name: z.string(),
    })
  ),
  pustakaPendukung: z.array(
    z.object({
      name: z.string(),
    })
  ),
  hardware: z.string(),
  software: z.string(),
});

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [mk, setMK] = useState<MK | undefined>();
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedRencana, setSelectedRencana] =
    useState<RencanaPembelajaran | null>(null);
  const [selectedTahun, setSelectedTahun] = useState("");

  // edit prerequisite
  const [allMK, setAllMK] = useState<MK[]>([]);
  const [selectedPrerequisite, setSelectedPrerequisite] = useState<string[]>(
    []
  );
  const [prevPrerequisite, setPrevPrerequisite] = useState<string[]>([]);
  const [searchPrerequisite, setSearchPrerequisite] = useState<string>("");

  const filteredMK = allMK?.filter((mk) =>
    mk.kode.toLowerCase().includes(searchPrerequisite.toLowerCase())
  );

  //Relasi CPMK & BK
  const [cpmk, setCPMK] = useState<CPMK[] | undefined>([]);
  const [bk, setBK] = useState<BK[] | undefined>([]);
  const [prevSelectedCPMK, setPrevSelectedCPMK] = useState<string[]>([]);
  const [prevSelectedBK, setPrevSelectedBK] = useState<string[]>([]);
  const [searchCPMK, setSearchCPMK] = useState<string>("");
  const [searchBK, setSearchBK] = useState<string>("");
  const [selectedCPMK, setSelectedCPMK] = useState<string[]>([]);
  const [selectedBK, setSelectedBK] = useState<string[]>([]);
  const [selectedRelasi, setSelectedRelasi] = useState<string>("");
  const [listCPL, setListCPL] = useState<CPL[]>([]);
  const [teamTeaching, setTeamTeaching] = useState<string[]>([]);
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

  const rpsForm = useForm<z.infer<typeof rpsSchema>>({
    resolver: zodResolver(rpsSchema),
    defaultValues: {
      deskripsi: "",
      pustakaUtama: [],
      pustakaPendukung: [],
      hardware: "",
      software: "",
    },
  });

  const {
    fields: pustakaUtamaFields,
    append: appendPustakaUtama,
    remove: removePustakaUtama,
  } = useFieldArray({
    control: rpsForm.control,
    name: "pustakaUtama",
  });

  const {
    fields: pustakaPendukungFields,
    append: appendPustakaPendukung,
    remove: removePustakaPendukung,
  } = useFieldArray({
    control: rpsForm.control,
    name: "pustakaPendukung",
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const addedPrerequisiteId = selectedPrerequisite.filter(
      (item) => !prevPrerequisite.includes(item)
    );
    const removedPrerequisiteId = prevPrerequisite.filter(
      (item) => !selectedPrerequisite.includes(item)
    );

    const data = {
      deskripsi: values.deskripsi,
      sks: values.sks,
      batasLulusMahasiswa: parseFloat(values.batasLulusMahasiswa),
      batasLulusMK: parseFloat(values.batasLulusMK),
      addedPrerequisiteId,
      removedPrerequisiteId,
    };

    axiosConfig
      .patch(`api/mk/${kode}`, data)
      .then((response) => {
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
      .catch((error) => {
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
            new Set(response.data.data.CPMK.map((cpmk: CPMK) => cpmk.CPL))
          )
        );

        const prevSelectedCPMK = response.data.data.CPMK.map(
          (item: CPMK) => item.kode
        );

        const prevSelectedBK = response.data.data.BK.map(
          (item: BK) => item.kode
        );

        const prevPrerequisite = response.data.data.prerequisitesMK.map(
          (item: MK) => item.kode
        );

        setSelectedCPMK(prevSelectedCPMK);
        setPrevSelectedCPMK(prevSelectedCPMK);

        setSelectedBK(prevSelectedBK);
        setPrevSelectedBK(prevSelectedBK);

        setSelectedPrerequisite(prevPrerequisite);
        setPrevPrerequisite(prevPrerequisite);

        //form edit data mk
        form.setValue("deskripsi", response.data.data.deskripsi);
        form.setValue("deskripsiInggris", response.data.data.deskripsiInggris);
        form.setValue("sks", response.data.data.sks);
        form.setValue("semester", response.data.data.semester);
        form.setValue(
          "batasLulusMahasiswa",
          String(response.data.data.batasLulusMahasiswa)
        );
        form.setValue("batasLulusMK", String(response.data.data.batasLulusMK));

        //form revisi rps
        if (response.data.data.rps) {
          rpsForm.setValue("deskripsi", response.data.data.rps.deskripsi);
          rpsForm.setValue("hardware", response.data.data.rps.hardware);
          rpsForm.setValue("software", response.data.data.rps.software);

          rpsForm.setValue("pustakaUtama", []);
          response.data.data.rps.pustakaUtama.map((item: string) => {
            appendPustakaUtama({ name: item });
          });

          rpsForm.setValue("pustakaPendukung", []);
          response.data.data.rps.pustakaPendukung.map((item: string) => {
            appendPustakaPendukung({ name: item });
          });
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllMK = async () => {
    try {
      if (mk) {
        const response = await axiosConfig.get(
          `api/mk?prodi=${accountData?.prodiId}&limit=99999`
        );
        if (response.data.status !== 400) {
          const filteredMK = response.data.data.filter((item: MK) => {
            return (
              item.kode !== mk.kode &&
              !mk.isPrerequisiteFor.some(
                (prerequisite) => prerequisite.kode === item.kode
              )
            );
          });

          setAllMK(filteredMK);
        } else {
          alert(response.data.message);
        }
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getAllCPMK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/cpmk?prodi=${accountData?.prodiId}&limit=99999`
      );

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPMK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const getAllBK = async () => {
    try {
      const response = await axiosConfig.get(
        `api/bk?prodi=${accountData?.prodiId}&limit=99999`
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

  const handleCheckPrerequisite = (kode: string) => {
    setSelectedPrerequisite((prevPrerequisite) => {
      if (!prevPrerequisite.includes(kode)) {
        return [...prevPrerequisite, kode];
      } else {
        return prevPrerequisite.filter((item) => item !== kode);
      }
    });
  };

  const updateCPMK = async () => {
    const addedCPMKId: string[] = selectedCPMK.filter(
      (item) => !prevSelectedCPMK.includes(item)
    );
    const removedCPMKId: string[] = prevSelectedCPMK.filter(
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
    const addedBKId: string[] = selectedBK.filter(
      (item) => !prevSelectedBK.includes(item)
    );
    const removedBKId: string[] = prevSelectedBK.filter(
      (item) => !selectedBK.includes(item)
    );

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
      const response = await axiosConfig.get(`api/tahun-ajaran?limit=99999`);
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

  const onDeleteAllRencana = async () => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus semua rencana pembelajaran?`,
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
        .delete("api/rencanaPembelajaran", { data })
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

  const delRencana = async (id: number) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus rencana pembelajaran ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
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
    }
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

  const revisiRPS = async (values: z.infer<typeof rpsSchema>, e: any) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin revisi RPS ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
      const currentDate = new Date();

      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(currentDate);

      const payload = {
        ...values,
        pustakaUtama: values.pustakaUtama.map((item) => item.name),
        pustakaPendukung: values.pustakaPendukung.map((item) => item.name),
        dosenId: accountData?.id,
        MKId: kode,
        revisi: formattedDate,
      };

      axiosConfig
        .post(`api/rps`, payload)
        .then(function (response) {
          if (response.data.status !== 400) {
            toast({
              title: "Berhasil Revisi RPS",
              description: `MK ${kode}`,
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
  };

  const getTeamTeaching = () => {
    const allDosen: string[] = [];

    if (mk) {
      // Iterate through each kelas in the MKData to collect dosen
      mk.kelas.forEach((kelas) => {
        kelas.dosen.forEach((dosen) => {
          // Check if the dosen is already added
          if (!allDosen.some((existingDosen) => existingDosen === dosen.nama)) {
            allDosen.push(dosen.nama);
          }
        });
      });
      setTeamTeaching(allDosen);
    }
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
  }, [refresh]);

  useEffect(() => {
    getAllCPMK();
    getAllBK();
  }, []); // Trigger useEffect only on initial mount

  useEffect(() => {
    getAllMK();
    getTeamTeaching();
  }, [mk]);

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
            <Button
              className={accountData?.role === "Dosen" ? "hidden" : ""}
              variant='destructive'
              onClick={() => delKelas(kelas.id)}
            >
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
          <TableCell>{rencana.materi}</TableCell>
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
                            <FormItem>
                              <FormLabel>Materi</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='Materi...'
                                  required
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
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
        <div className='flex justify-between'>
          <p className='ml-2 font-bold text-2xl'>Detail Mata Kuliah</p>
          <div className='flex gap-3'>
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
              <DialogTrigger
                className={accountData?.role === "Dosen" ? "hidden" : ""}
                asChild
              >
                <Button variant='outline'>Edit Data</Button>
              </DialogTrigger>
              <DialogContent>
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
                            <Input
                              placeholder='Deskripsi'
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
                      name='sks'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKS</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Pilih Jumlah SKS' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4].map((item) => (
                                <SelectItem key={item} value={String(item)}>
                                  {item}
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

                    <div className='space-y-2'>
                      <FormLabel>Prerequisite Mata Kuliah</FormLabel>
                      <div className='flex flex-row items-center mb-5'>
                      <input
                        type='text'
                        className='p-2 border-[1px] rounded-md border-gray-400 outline-none'
                        value={searchPrerequisite}
                        placeholder='Cari...'
                        onChange={(e) => setSearchPrerequisite(e.target.value)}
                      />
                    </div>
                      <div className='grid grid-cols-3 gap-3'>
                        {allMK.length > 0 ? (
                          filteredMK.map((mk, index) => (
                            <DataCard<MK>
                              key={index}
                              selected={selectedPrerequisite}
                              handleCheck={handleCheckPrerequisite}
                              data={mk}
                            />
                          ))
                        ) : (
                          <div className='text-center text-xl animate-pulse'>
                            Belum ada MK ...
                          </div>
                        )}
                      </div>
                    </div>

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
          </div>
        </div>

        <Table className='w-full table-fixed mb-5'>
          <TableBody>
            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Kode</strong>
              </TableCell>
              <TableCell className='p-2'>: {mk.kode}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Nama</strong>
              </TableCell>
              <TableCell className='p-2'>: {mk.deskripsi}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Nama Inggris</strong>
              </TableCell>
              <TableCell className='p-2'>: {mk.deskripsiInggris}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Kelompok Keahlian</strong>
              </TableCell>
              <TableCell className='p-2'>: {mk.KK.nama}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Jumlah SKS</strong>
              </TableCell>
              <TableCell className='p-2'>: {mk.sks}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>CPMK</strong>
              </TableCell>
              <TableCell className='p-2'>
                : {mk.CPMK.map((cpmk) => cpmk.kode).join(", ")}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>BK</strong>
              </TableCell>
              <TableCell className='p-2'>
                : {mk.BK.map((bk) => bk.kode).join(", ")}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='w-[20%] p-2'>
                <strong>Performa</strong>
              </TableCell>
              <TableCell className='p-2'>
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
          </TableBody>
        </Table>

        <Tabs defaultValue='kelas' className='w-full'>
          <TabsList
            className={`grid w-full ${
              accountData?.role === "Dosen" ? "grid-cols-4" : "grid-cols-5"
            }`}
          >
            <TabsTrigger value='kelas'>Data Kelas</TabsTrigger>
            <TabsTrigger value='rencana'>Rencana Pembelajaran</TabsTrigger>
            <TabsTrigger value='asesment'>
              Rencana Asesment dan Evaluasi
            </TabsTrigger>
            <TabsTrigger value='rps'>RPS</TabsTrigger>
            <TabsTrigger
              className={accountData?.role === "Dosen" ? "hidden" : ""}
              value='relasi'
            >
              Sambungkan CPMK/BK
            </TabsTrigger>
          </TabsList>
          <TabsContent value='kelas'>
            {filteredKelas?.length != 0 ? (
              <Card className='w-[1200px] mx-auto'>
                <CardHeader className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <CardTitle>Tabel Kelas</CardTitle>
                    <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                  </div>
                  <Button
                    className={accountData?.role === "Dosen" ? "hidden" : ""}
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
                          {mk.CPMK.map((cpmk) => {
                            return (
                              <TableHead key={cpmk.id}>{cpmk.kode}</TableHead>
                            );
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
                            <Textarea
                              placeholder='Materi...'
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
                      onDeleteAllRencana();
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
            <Card className='mx-auto w-[100%]'>
              <CardHeader className='flex flex-row justify-between items-center'>
                <div className='flex flex-col'>
                  <CardTitle>Rencana Pembelajaran Semester</CardTitle>
                  <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                </div>

                <div className='flex gap-3'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant='outline'>Revisi RPS</Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-[600px] max-h-[800px] overflow-auto'>
                      <DialogHeader>
                        <DialogTitle>
                          Revisi Rencana Pembelajaran Semester
                        </DialogTitle>
                        <DialogDescription>
                          Mata Kuliah {mk.kode}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...rpsForm}>
                        <form
                          onSubmit={rpsForm.handleSubmit(revisiRPS)}
                          className='space-y-8'
                        >
                          <FormField
                            control={rpsForm.control}
                            name='deskripsi'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deskripsi MK</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='Deskripsi...'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Pustaka Utama Fields */}
                          <div>
                            <div className='flex justify-between items-center mb-3'>
                              <FormLabel>Pustaka Utama</FormLabel>
                              <Button
                                type='button'
                                variant={"outline"}
                                className='h-50'
                                onClick={() => appendPustakaUtama({ name: "" })}
                              >
                                Tambah
                              </Button>
                            </div>

                            {pustakaUtamaFields.map((item, index) => (
                              <FormItem key={item.id} className='mb-3'>
                                <FormControl>
                                  <FormField
                                    name={`pustakaUtama.${index}.name` as const} // Type assertion to ensure correct type
                                    control={rpsForm.control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder='Pustaka Utama...'
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormControl>
                                {index === pustakaUtamaFields.length - 1 && (
                                  <Button
                                    type='button'
                                    onClick={() => removePustakaUtama(index)}
                                    className='mt-2'
                                  >
                                    Hapus
                                  </Button>
                                )}
                                <FormMessage />
                              </FormItem>
                            ))}
                          </div>

                          {/* Pustaka Pendukung Fields */}
                          <div>
                            <div className='flex justify-between items-center mb-3'>
                              <FormLabel>Pustaka Pendukung</FormLabel>
                              <Button
                                type='button'
                                variant={"outline"}
                                className='h-50'
                                onClick={() =>
                                  appendPustakaPendukung({ name: "" })
                                }
                              >
                                Tambah
                              </Button>
                            </div>

                            {pustakaPendukungFields.map((item, index) => (
                              <FormItem key={item.id} className='mb-3'>
                                <FormControl>
                                  <FormField
                                    name={
                                      `pustakaPendukung.${index}.name` as const
                                    } // Type assertion to ensure correct type
                                    control={rpsForm.control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder='Pustaka Pendukung...'
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormControl>
                                {index ===
                                  pustakaPendukungFields.length - 1 && (
                                  <Button
                                    type='button'
                                    onClick={() =>
                                      removePustakaPendukung(index)
                                    }
                                    className='mt-2'
                                  >
                                    Hapus
                                  </Button>
                                )}
                                <FormMessage />
                              </FormItem>
                            ))}
                          </div>

                          {/* Additional Fields */}
                          <FormField
                            name='hardware'
                            control={rpsForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hardware</FormLabel>
                                <FormControl>
                                  <Input placeholder='Hardware...' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name='software'
                            control={rpsForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Software</FormLabel>
                                <FormControl>
                                  <Input placeholder='Software...' {...field} />
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
                              <TableCell>{mk.kode}</TableCell>
                              <TableCell>{mk.KK.nama}</TableCell>
                              <TableCell>{mk.sks}</TableCell>
                              <TableCell>{mk.semester}</TableCell>
                              <TableCell>
                                {mk.rps && mk.rps.revisi ? mk.rps.revisi : "-"}
                              </TableCell>
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
                              <TableCell>
                                {mk.rps && mk.rps.pengembang
                                  ? mk.rps.pengembang.nama
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {mk.KK.ketua ? mk.KK.ketua.nama : "-"}
                              </TableCell>
                              <TableCell>{mk.prodi.kaprodi?.nama}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Deskripsi Mata Kuliah</TableHead>
                      <TableCell>
                        {mk.rps && mk.rps.deskripsi ? mk.rps.deskripsi : "-"}
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
                            {listCPL.map((cpl: CPL) => (
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
                            {mk.CPMK.map((cpmk: CPMK) => (
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
                            {mk.rps && mk.rps.pustakaUtama.length > 0 ? (
                              mk.rps.pustakaUtama.map((pustaka, index) => (
                                <TableRow key={index}>
                                  <TableCell>{pustaka}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell>-</TableCell>
                              </TableRow>
                            )}
                            <TableRow className='bg-[#CCCCCC]'>
                              <TableHead>Pendukung:</TableHead>
                            </TableRow>
                            {mk.rps && mk.rps.pustakaPendukung.length > 0 ? (
                              mk.rps.pustakaPendukung.map((pustaka, index) => (
                                <TableRow key={index}>
                                  <TableCell>{pustaka}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell>-</TableCell>
                              </TableRow>
                            )}
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
                              <TableCell>
                                {mk.rps && mk.rps.software
                                  ? mk.rps.software
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {mk.rps && mk.rps.hardware
                                  ? mk.rps.hardware
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Team Teaching</TableHead>
                      <TableCell>
                        <p>
                          {teamTeaching.length > 0
                            ? teamTeaching.map((dosen, index) => (
                                <span key={index}>
                                  {dosen}{" "}
                                  {index < teamTeaching.length - 1 ? ", " : ""}
                                </span>
                              ))
                            : "-"}
                        </p>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead>Matakuliah Syarat</TableHead>
                      <TableCell>
                        <p>
                          {mk.prerequisitesMK.length === 0
                            ? "-"
                            : mk.prerequisitesMK
                                .map((prereq) => prereq.kode)
                                .join(", ")}
                        </p>
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
                    <div className='flex overflow-x-auto space-x-4 p-2'>
                      {filteredCPMK && filteredCPMK.length > 0 ? (
                        filteredCPMK?.map((cpmk, index) => {
                          return (
                            <DataCard<CPMK>
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
                    <div className='flex overflow-x-auto space-x-4 p-2'>
                      {filteredBK && filteredBK.length > 0 ? (
                        filteredBK?.map((bk, index) => {
                          return (
                            <DataCard<BK>
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
