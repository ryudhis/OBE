/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
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
import { useForm, useFieldArray } from "react-hook-form";
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
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "@/app/contexts/AccountContext";
import { useKunci } from "@/app/contexts/KunciContext";
import { DataCard } from "@/components/DataCard";
import Swal from "sweetalert2";
import TemplatePenilaianContent from "@/components/TemplatePenilaianContent";
import RencanaPembelajaranTab from "@/components/RPTabs";
import { FileText } from "lucide-react";

const formSchema = z.object({
  deskripsi: z.string().min(1),
  deskripsiInggris: z.string().min(1),
  sks: z.string(),
  semester: z.string(),
  batasLulusMahasiswa: z.string(),
  batasLulusMK: z.string(),
  jumlahKelas: z.string(),
});

const rpsSchema = z.object({
  deskripsi: z.string().min(1),
  materiPembelajaran: z.string().min(1),
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

export default function Page() {
  const params = useParams();
  const kode = params.kode;
  const [mk, setMK] = useState<MK | undefined>();
  const [currentTemplate, setCurrentTemplate] =
    useState<TemplatePenilaianCPMK>();
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const { accountData } = useAccount();
  const { kunciSistem } = useKunci();
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedTahun, setSelectedTahun] = useState("");
  const [rencanaByWeek, setRencanaByWeek] = useState<Record<
    number,
    RencanaPembelajaran
  > | null>(null);

  // Create an array of 16 weeks
  const allWeeks = Array.from({ length: 16 }, (_, i) => i + 1);

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
    },
  });

  const rpsForm = useForm<z.infer<typeof rpsSchema>>({
    resolver: zodResolver(rpsSchema),
    defaultValues: {
      deskripsi: "",
      materiPembelajaran: "",
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

        const activeTemplate = response.data.data.templatePenilaianCPMK.find(
          (template: TemplatePenilaianCPMK) => template.active === true
        );

        if (activeTemplate) {
          setCurrentTemplate(activeTemplate);
          setRencanaByWeek(
            activeTemplate.rencanaPembelajaran.reduce(
              (
                acc: Record<number, RencanaPembelajaran>,
                rp: RencanaPembelajaran
              ) => {
                acc[rp.minggu] = rp;
                return acc;
              },
              {} as Record<number, RencanaPembelajaran>
            )
          );
        }

        const uniqueCPLMap = new Map();

        response.data.data.CPMK.forEach((cpmk: CPMK) => {
          const cpl = cpmk.CPL;
          if (!uniqueCPLMap.has(cpl.kode)) {
            uniqueCPLMap.set(cpl.kode, cpl);
          }
        });

        setListCPL(Array.from(uniqueCPLMap.values()));

        console.log(
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
          rpsForm.setValue(
            "materiPembelajaran",
            response.data.data.rps.materiPembelajaran
          );
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

  const getStatistic = async () => {
    if (selectedTahun)
      try {
        console.log("selected tahun ", selectedTahun);
        const response = await axiosConfig.get(
          `api/mk/statistic/${kode}?tahunAjaran=${selectedTahun}`
        );
        if (response.data.status !== 400) {
          console.log(response.data.data);
        } else {
          alert(response.data.message);
        }
      } catch (error: any) {
        throw error;
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

  const handleAddSignature = async (role: string) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `
      Kamu yakin ingin menambahkan tanda tangan ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });
    if (result.isConfirmed) {
      axiosConfig
        .patch("api/rps/signature", {
          MKId: mk?.kode,
          role: role,
          signature: accountData?.signature,
        })
        .then(function (response) {
          if (response.data.status != 400) {
            toast({
              title: "Berhasil Submit",
              description: String(new Date()),
            });
          } else {
            toast({
              title: "Gagal Submit!",
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
            handleAddSignature("Pengembang");
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
        // 1. Get the element's height in pixels
        const rect = element.getBoundingClientRect();
        const pxHeight = rect.height + 20;
        const pxWidth = rect.width;

        // 2. Convert px to inches (1in = 96px)
        const inchHeight = pxHeight / 96;
        const inchWidth = pxWidth / 96;

        // 3. Set options with dynamic height
        const options = {
          margin: [0.1, 0, 0, 0] as [number, number, number, number], // Margins in inches
          filename: `RPS_MK_${mk?.kode}.pdf`,
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: -window.scrollY,
          },
          jsPDF: {
            unit: "in",
            format: [inchWidth, inchHeight] as [number, number], // Dynamic size, ensure tuple
            orientation: "portrait",
            compressPDF: true,
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

  useEffect(() => {
    getStatistic();
  }, [mk, selectedTahun]);

  const renderData = () => {
    return filteredKelas?.map((kelas) => {
      return (
        <TableRow key={kelas.id}>
          <TableCell className="w-[8%]">{kelas.nama}</TableCell>
          <TableCell className="w-[8%]">
            {kelas.tahunAjaran.tahun} - {kelas.tahunAjaran.semester}
          </TableCell>
          <TableCell className="w-[8%]">
            {kelas.mahasiswa ? kelas.mahasiswa.length : 0}
          </TableCell>
          <TableCell className="w-[8%]">{kelas.jumlahLulus}</TableCell>
          {kelas.dataCPMK &&
            kelas.dataCPMK.map((cpmk: dataCPMK) => (
              <TableCell key={cpmk.cpmk} className="w-[8%]">
                {cpmk.persenLulus ? `${cpmk.persenLulus}%` : "-"}
              </TableCell>
            ))}

          {(kelas.dataCPMK ?? []).length === 0 &&
            mk?.CPMK.map((_, index) => (
              <TableCell key={index} className="w-[8%]">
                -
              </TableCell>
            ))}

          <TableCell className="w-[8%]">
            {kelas.MK.batasLulusMahasiswa}
          </TableCell>
          <TableCell className="w-[8%] flex gap-2">
            <Button
              className={accountData?.role === "Dosen" ? "hidden" : ""}
              variant="destructive"
              onClick={() => delKelas(kelas.id)}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                router.push(
                  `/dashboard/data/mk/${kelas.MK.kode}/kelas/${kelas.id}/`
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

  const renderDataPenilaian = () => {
    // Gather all unique kriteria
    const allKriteria = Array.from(
      new Set(
        currentTemplate?.penilaianCPMK.flatMap((item) =>
          item.kriteria.map((k) => k.kriteria)
        )
      )
    );

    // Gather all CPMK codes
    const allCPMK =
      currentTemplate?.penilaianCPMK.map((pcpmk) => pcpmk.CPMK.kode) || [];

    // Build a mapping of kriteria to CPMK bobot
    const kriteriaRows = allKriteria.map((kriteria) => {
      const row: { [key: string]: string | number } = { kriteria };
      let totalBobot = 0;

      allCPMK.forEach((kode) => {
        const pcpmk = currentTemplate?.penilaianCPMK.find(
          (p) => p.CPMK.kode === kode
        );
        const foundKriteria = pcpmk?.kriteria.find(
          (k) => k.kriteria === kriteria
        );
        const bobot = foundKriteria ? foundKriteria.bobot : 0;
        row[kode] = bobot;
        totalBobot += bobot;
      });

      row["totalBobot"] = totalBobot;
      return row;
    });

    // Step 4: Add a final row for total per CPMK
    const totalPerCPMK: { [key: string]: string | number } = {
      kriteria: "Total Bobot per CPMK",
    };
    let overallTotal = 0;

    allCPMK.forEach((kode) => {
      let sum = 0;
      allKriteria.forEach((kriteria) => {
        const row = kriteriaRows.find((r) => r.kriteria === kriteria);
        sum += (row?.[kode] as number) || 0;
      });
      totalPerCPMK[kode] = sum;
      overallTotal += sum;
    });

    totalPerCPMK["totalBobot"] = overallTotal;

    return (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-300">
            <th className="border border-gray-300 p-2 font-semibold text-left">
              Penilaian (Kriteria)
            </th>
            {allCPMK.map((kode) => (
              <th
                key={kode}
                className="border border-gray-300 p-2 font-semibold text-left"
              >
                {kode}
              </th>
            ))}
            <th className="border border-gray-300 p-2 font-semibold text-left">
              Total Bobot
            </th>
          </tr>
        </thead>
        <tbody>
          {kriteriaRows.map((row, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{row.kriteria}</td>
              {allCPMK.map((kode) => (
                <td key={kode} className="border border-gray-300 p-2">
                  {row[kode]}
                </td>
              ))}
              <td className="border border-gray-300 p-2">{row.totalBobot}</td>
            </tr>
          ))}
          <tr>
            <td className="border border-gray-300 p-2">
              {totalPerCPMK.kriteria}
            </td>
            {allCPMK.map((kode) => (
              <td key={kode} className="border border-gray-300 p-2">
                {totalPerCPMK[kode]}
              </td>
            ))}
            <td className="border border-gray-300 p-2">
              {totalPerCPMK.totalBobot}
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderDataAsesment = () => {
    if (!currentTemplate || currentTemplate.penilaianCPMK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            Belum Ada Asesmen
          </TableCell>
        </TableRow>
      );
    }

    const kriteriaMap = new Map<
      string,
      { bobot: number[]; totalBobot: number }
    >();

    currentTemplate.penilaianCPMK.forEach((CPMK) => {
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

    if (kriteriaArray.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            Belum Ada Asesmen
          </TableCell>
        </TableRow>
      );
    }

    return kriteriaArray.map(([kriteriaName, kriteriaData], index) => (
      <TableRow key={kriteriaName}>
        <TableCell className="w-[8%] text-center">{index + 1}</TableCell>
        <TableCell className="w-[16%]">{kriteriaName}</TableCell>
        {currentTemplate.penilaianCPMK.map((CPMK) => (
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
      <main className="w-screen max-w-7xl mx-auto pt-20 p-5">
        <div className="flex justify-between">
          <p className="ml-2 font-bold text-2xl">Detail Mata Kuliah</p>
          <div className="flex gap-3">
            <Select onValueChange={handleTahunChange} value={selectedTahun}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Tahun Ajaran" />
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
                <Button variant="outline" disabled={kunciSistem?.data}>
                  Edit Data
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                            <Input
                              placeholder="Deskripsi"
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
                      name="deskripsiInggris"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Inggris</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Deskripsi Inggris"
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
                      name="sks"
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
                                <SelectValue placeholder="Pilih Jumlah SKS" />
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
                      name="semester"
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
                                <SelectValue placeholder="Pilih Semester" />
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

                    <div className="space-y-2">
                      <FormLabel>Prerequisite Mata Kuliah</FormLabel>
                      <div className="flex flex-row items-center mb-5">
                        <input
                          type="text"
                          className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
                          value={searchPrerequisite}
                          placeholder="Cari..."
                          onChange={(e) =>
                            setSearchPrerequisite(e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
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
                          <div className="text-center text-xl animate-pulse">
                            Belum ada MK ...
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600"
                          type="submit"
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

        <Table className="w-full table-fixed mb-5">
          <TableBody>
            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Kode</strong>
              </TableCell>
              <TableCell className="p-2">: {mk.kode}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Nama</strong>
              </TableCell>
              <TableCell className="p-2">: {mk.deskripsi}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Nama Inggris</strong>
              </TableCell>
              <TableCell className="p-2">: {mk.deskripsiInggris}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Kelompok Keahlian</strong>
              </TableCell>
              <TableCell className="p-2">: {mk.KK.nama}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Jumlah SKS</strong>
              </TableCell>
              <TableCell className="p-2">: {mk.sks}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>CPMK</strong>
              </TableCell>
              <TableCell className="p-2">
                : {mk.CPMK.map((cpmk) => cpmk.kode).join(", ")}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>BK</strong>
              </TableCell>
              <TableCell className="p-2">
                : {mk.BK.map((bk) => bk.kode).join(", ")}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="w-[20%] p-2">
                <strong>Performa</strong>
              </TableCell>
              <TableCell className="p-2">
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

        <Tabs defaultValue="kelas" className="w-full">
          <TabsList
            className={`grid w-full ${
              accountData?.role === "Dosen" ? "grid-cols-5" : "grid-cols-6"
            }`}
          >
            <TabsTrigger value="kelas">Data Kelas</TabsTrigger>
            <TabsTrigger value="rencana">Rencana Pembelajaran</TabsTrigger>
            <TabsTrigger value="asesment">Asesment dan Evaluasi</TabsTrigger>
            <TabsTrigger value="rps">RPS</TabsTrigger>
            <TabsTrigger value="templatePenilaian">
              Template Penilaian
            </TabsTrigger>
            <TabsTrigger
              className={accountData?.role === "Dosen" ? "hidden" : ""}
              value="relasi"
            >
              Sambungkan CPMK/BK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kelas">
            {filteredKelas?.length != 0 ? (
              <Card className="w-[1200px] mx-auto">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div className="flex flex-col">
                    <CardTitle>Tabel Kelas</CardTitle>
                    <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                  </div>
                  <Button
                    className={accountData?.role === "Dosen" ? "hidden" : ""}
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
                          <TableHead className="w-[8%]">Tahun Ajaran</TableHead>
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
                          <TableHead className="w-[8%]">Tahun Ajaran</TableHead>
                          <TableHead className="w-[8%]">
                            Jumlah Mahasiswa
                          </TableHead>
                          <TableHead className="w-[8%]">Jumlah Lulus</TableHead>
                          {mk.CPMK.map((cpmk) => {
                            return (
                              <TableHead key={cpmk.id}>{cpmk.kode}</TableHead>
                            );
                          })}
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
            {currentTemplate ? (
              <RencanaPembelajaranTab
                templatePenilaian={currentTemplate}
                isLoading={false}
                setRefresh={setRefresh}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Belum ada template penilaian yang aktif
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Saat ini belum ada template penilaian yang aktif. Silakan
                    buat atau aktifkan template terlebih dahulu.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="asesment">
            <Card className="w-[1000px] mx-auto">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <CardTitle>Rencana Asesment dan Evaluasi</CardTitle>
                  <CardDescription>Mata Kuliah {mk.deskripsi}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {" "}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[8%] text-center">No</TableHead>
                      <TableHead className="w-[16%]">
                        Rencana Evaluasi
                      </TableHead>
                      {currentTemplate?.penilaianCPMK.map((CPMK) => (
                        <TableHead
                          key={CPMK.CPMK.kode}
                          className="w-[8%] text-center"
                        >
                          {`${CPMK.CPMK.kode}`}
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

          <TabsContent className="flex flex-col gap-3" value="rps">
            <Card className="mx-auto w-[100%]">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <CardTitle>Rencana Pembelajaran Semester</CardTitle>
                  <CardDescription>Mata Kuliah {mk.kode}</CardDescription>
                </div>

                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Revisi RPS</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[600px] max-h-[800px] overflow-auto">
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
                          className="space-y-8"
                        >
                          <FormField
                            control={rpsForm.control}
                            name="deskripsi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deskripsi MK</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Deskripsi..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={rpsForm.control}
                            name="materiPembelajaran"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Materi Pembelajaran / Pokok Bahasn
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Materi..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <FormLabel>Pustaka Utama</FormLabel>
                              <Button
                                type="button"
                                variant={"outline"}
                                className="h-50"
                                onClick={() => appendPustakaUtama({ name: "" })}
                              >
                                Tambah
                              </Button>
                            </div>

                            {pustakaUtamaFields.map((item, index) => (
                              <FormItem key={item.id} className="mb-3">
                                <FormControl>
                                  <FormField
                                    name={`pustakaUtama.${index}.name` as const} // Type assertion to ensure correct type
                                    control={rpsForm.control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder="Pustaka Utama..."
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormControl>
                                {index === pustakaUtamaFields.length - 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removePustakaUtama(index)}
                                    className="mt-2"
                                  >
                                    Hapus
                                  </Button>
                                )}
                                <FormMessage />
                              </FormItem>
                            ))}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <FormLabel>Pustaka Pendukung</FormLabel>
                              <Button
                                type="button"
                                variant={"outline"}
                                className="h-50"
                                onClick={() =>
                                  appendPustakaPendukung({ name: "" })
                                }
                              >
                                Tambah
                              </Button>
                            </div>

                            {pustakaPendukungFields.map((item, index) => (
                              <FormItem key={item.id} className="mb-3">
                                <FormControl>
                                  <FormField
                                    name={
                                      `pustakaPendukung.${index}.name` as const
                                    } // Type assertion to ensure correct type
                                    control={rpsForm.control}
                                    render={({ field }) => (
                                      <Input
                                        placeholder="Pustaka Pendukung..."
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormControl>
                                {index ===
                                  pustakaPendukungFields.length - 1 && (
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      removePustakaPendukung(index)
                                    }
                                    className="mt-2"
                                  >
                                    Hapus
                                  </Button>
                                )}
                                <FormMessage />
                              </FormItem>
                            ))}
                          </div>

                          <FormField
                            name="hardware"
                            control={rpsForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hardware</FormLabel>
                                <FormControl>
                                  <Input placeholder="Hardware..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name="software"
                            control={rpsForm.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Software</FormLabel>
                                <FormControl>
                                  <Input placeholder="Software..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                className="bg-blue-500 hover:bg-blue-600"
                                type="submit"
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

              <CardContent id="RPS">
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center border border-gray-300 p-4"
                      >
                        <div
                          id="header"
                          className="flex w-full items-center justify-between"
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/Logo1.png`}
                            alt="LOGO UNIVERSITAS"
                            width="100"
                            height="100"
                          />

                          <div>
                            <h2 className="font-bold text-lg">
                              RENCANA PEMBELAJARAN SEMESTER
                            </h2>
                            <h3 className="font-semibold">
                              PROGRAM STUDI S1 TEKNIK INFORMATIKA
                            </h3>
                            <h4 className="font-medium">
                              FAKULTAS TEKNOLOGI INDUSTRI
                            </h4>
                            <h5>INSTITUT TEKNOLOGI SUMATERA</h5>
                          </div>

                          <div />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Identitas Mata Kuliah
                      </th>
                      <td className="border border-gray-300 p-3">
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            <tr className="bg-gray-300">
                              <th className="border border-gray-300 p-2 font-semibold">
                                NAMA MK
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                KODE MK
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                RUMPUN MATA KULIAH
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                BOBOT (SKS)
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                SEMESTER
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                Tgl Penyusunan
                              </th>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">
                                {mk.deskripsi}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.kode}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.KK.nama}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.sks}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.semester}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.rps && mk.rps.revisi ? mk.rps.revisi : "-"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Otoritas Pengembang RPS
                      </th>
                      <td className="border border-gray-300 p-3">
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            <tr className="w-full bg-gray-300">
                              <th className="border border-gray-300 p-2 font-semibold">
                                Pengembang RPS
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                GKMP
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                Ketua Kelompok Keahlian
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                Ka PRODI
                              </th>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">
                                {mk.rps?.signaturePengembang ? (
                                  <div
                                    className="w-fit"
                                    dangerouslySetInnerHTML={{
                                      __html: mk.rps.signaturePengembang,
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.rps?.signatureGKMP ? (
                                  <div
                                    className="w-fit"
                                    dangerouslySetInnerHTML={{
                                      __html: mk.rps.signatureGKMP,
                                    }}
                                  />
                                ) : !accountData?.signature ? (
                                  <p>Anda belum memiliki signature</p>
                                ) : accountData.role === "GKMP" ? (
                                  <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => handleAddSignature("GKMP")}
                                  >
                                    Tambah Signature
                                  </button>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.rps?.signatureKetuaKK ? (
                                  <div
                                    className="w-fit"
                                    dangerouslySetInnerHTML={{
                                      __html: mk.rps.signatureKetuaKK,
                                    }}
                                  />
                                ) : !accountData?.signature ? (
                                  <p>Anda belum memiliki signature</p>
                                ) : accountData.nama === mk.KK.ketua?.nama ? (
                                  <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => handleAddSignature("KK")}
                                  >
                                    Tambah Signature
                                  </button>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.rps?.signatureKaprodi ? (
                                  <div
                                    className="w-fit"
                                    dangerouslySetInnerHTML={{
                                      __html: mk.rps.signatureKaprodi,
                                    }}
                                  />
                                ) : !accountData?.signature ? (
                                  <p>Anda belum memiliki signature</p>
                                ) : accountData.role === "Kaprodi" ? (
                                  <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() =>
                                      handleAddSignature("Kaprodi")
                                    }
                                  >
                                    Tambah Signature
                                  </button>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">
                                {mk.rps && mk.rps.pengembang
                                  ? mk.rps.pengembang.nama
                                  : "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.prodi.GKMP?.nama}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.KK.ketua ? mk.KK.ketua.nama : "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.prodi.kaprodi?.nama}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Capaian Pembelajaran
                      </th>
                      <td className="border border-gray-300 p-3">
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            <tr className="bg-gray-300">
                              <th
                                colSpan={3}
                                className="border border-gray-300 p-2 font-semibold"
                              >
                                Capaian Pembelajaran Lulusan (CPL)
                              </th>
                            </tr>
                            {listCPL.map((cpl) => (
                              <tr key={cpl.kode}>
                                <td className="w-[15%] border border-gray-300 p-2">
                                  {cpl.kode}
                                </td>
                                <td
                                  colSpan={2}
                                  className="border border-gray-300 p-2"
                                >
                                  {cpl.deskripsi}
                                </td>
                              </tr>
                            ))}

                            <tr className="bg-gray-300">
                              <th
                                colSpan={2}
                                className="border border-gray-300 p-2 font-semibold"
                              >
                                Capaian Pembelajaran Mata Kuliah (CPMK)
                              </th>
                              <th className="border border-gray-300 p-2 font-semibold">
                                CPL yang di dukung
                              </th>
                            </tr>
                            {mk.CPMK.map((cpmk) => (
                              <tr key={cpmk.kode}>
                                <td className="w-[15%] border border-gray-300 p-2">
                                  {cpmk.kode}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  {cpmk.deskripsi}
                                </td>
                                <td className="w-[20%] border border-gray-300 p-2">
                                  {cpmk.CPL.kode}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Penilaian
                      </th>
                      <td className="border border-gray-300 p-3">
                        {mk ? renderDataPenilaian() : null}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Deskripsi Singkat MK
                      </th>
                      <td className="border border-gray-300 p-3">
                        {mk.rps && mk.rps.deskripsi ? mk.rps.deskripsi : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Materi Pembelajaran / Pokok Bahasan
                      </th>
                      <td className="border border-gray-300 p-3">
                        {mk.rps && mk.rps.materiPembelajaran
                          ? mk.rps.materiPembelajaran
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Pustaka
                      </th>
                      <td className="border border-gray-300 p-3">
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            <tr className="bg-gray-300">
                              <th className="border border-gray-300 p-2 font-semibold text-left">
                                Utama:
                              </th>
                            </tr>
                            {mk.rps && mk.rps.pustakaUtama.length > 0 ? (
                              mk.rps.pustakaUtama.map((pustaka, index) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 p-2">
                                    {pustaka}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="border border-gray-300 p-2">
                                  -
                                </td>
                              </tr>
                            )}
                            <tr className="bg-gray-300">
                              <th className="border border-gray-300 p-2 font-semibold text-left">
                                Pendukung:
                              </th>
                            </tr>
                            {mk.rps && mk.rps.pustakaPendukung.length > 0 ? (
                              mk.rps.pustakaPendukung.map((pustaka, index) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 p-2">
                                    {pustaka}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="border border-gray-300 p-2">
                                  -
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Media Pembelajaran
                      </th>
                      <td className="border border-gray-300 p-3">
                        <table className="w-full border-collapse border border-gray-300">
                          <tbody>
                            <tr className="bg-gray-300">
                              <th className="w-[70%] border border-gray-300 p-2 font-semibold">
                                Software
                              </th>
                              <th className="w-[30%] border border-gray-300 p-2 font-semibold">
                                Hardware
                              </th>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">
                                {mk.rps && mk.rps.software
                                  ? mk.rps.software
                                  : "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {mk.rps && mk.rps.hardware
                                  ? mk.rps.hardware
                                  : "-"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Team Teaching
                      </th>
                      <td className="border border-gray-300 p-3">
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
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-100 text-left font-semibold">
                        Matakuliah Syarat
                      </th>
                      <td className="border border-gray-300 p-3">
                        <p>
                          {mk.prerequisitesMK.length === 0
                            ? "-"
                            : mk.prerequisitesMK
                                .map((prereq) => prereq.kode)
                                .join(", ")}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="mt-6 w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="bg-gray-300 w-max-full">
                      <th className="border border-gray-300 p-2 font-semibold">
                        Minggu ke-
                      </th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        CPMK
                      </th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        Bahan Kajian (Materi Pembelajaran)
                      </th>
                      <th className="w-[20%] border border-gray-300 p-2 font-semibold">
                        Bentuk dan Metode Pembelajaran (Media & Sumber Belajar)
                      </th>
                      <th className="w-[15%] border border-gray-300 p-2 font-semibold">
                        Estimasi Waktu
                      </th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        Pengalaman Belajar Mahasiswa
                      </th>
                      <th
                        colSpan={3}
                        className="w-full text-center border border-gray-300 p-2 font-semibold"
                      >
                        Penilaian
                      </th>
                    </tr>
                    <tr className="bg-gray-300">
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold"></th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        Kriteria dan Bentuk
                      </th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        Indikator
                      </th>
                      <th className="border border-gray-300 p-2 font-semibold">
                        Bobot (%)
                      </th>
                    </tr>

                    {allWeeks.map((weekNum) => {
                      const rp = (rencanaByWeek ?? {})[weekNum];

                      // Special handling for weeks 8 and 16
                      if (weekNum === 8) {
                        return (
                          <tr className="bg-gray-300" key={`week-${weekNum}`}>
                            <td className="border border-gray-300 p-2">
                              {weekNum}
                            </td>
                            <td
                              colSpan={8}
                              className="text-center font-medium border border-gray-300 p-2"
                            >
                              Ujian Tengah Semester (UTS)
                            </td>
                          </tr>
                        );
                      }

                      if (weekNum === 16) {
                        return (
                          <tr className="bg-gray-300" key={`week-${weekNum}`}>
                            <td className="border border-gray-300 p-2">
                              {weekNum}
                            </td>
                            <td
                              colSpan={8}
                              className="text-center font-medium border border-gray-300 p-2"
                            >
                              Ujian Akhir Semester (UAS)
                            </td>
                          </tr>
                        );
                      }

                      // For weeks with data
                      if (rp) {
                        return (
                          <React.Fragment key={`week-${weekNum}`}>
                            <tr>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                {weekNum}
                              </td>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                {rp.penilaianCPMKId
                                  ? rp.penilaianCPMK.CPMK.kode
                                  : "-"}
                              </td>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                {rp.bahanKajian || "-"}
                              </td>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                <div className="space-y-1">
                                  <p>
                                    <span className="font-medium">Bentuk:</span>{" "}
                                    {rp.bentuk || "-"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Metode:</span>{" "}
                                    {rp.metode || "-"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Sumber:</span>{" "}
                                    {rp.sumber || "-"}
                                  </p>
                                </div>
                              </td>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                {rp.waktu || "-"}
                              </td>
                              <td
                                rowSpan={rp.penilaianRP.length || 1}
                                className="border border-gray-300 p-2"
                              >
                                {rp.pengalaman || "-"}
                              </td>

                              {rp.penilaianRP.length > 0 ? (
                                <>
                                  <td className="border border-gray-300 p-2">
                                    {rp.penilaianRP[0]?.kriteria || "-"}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {rp.penilaianRP[0]?.indikator || "-"}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {rp.penilaianRP[0]?.bobot || "-"}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="border border-gray-300 p-2">
                                    -
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    -
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    -
                                  </td>
                                </>
                              )}
                            </tr>

                            {/* Render additional penilaian rows if there are more than one */}
                            {rp.penilaianRP.slice(1).map((penilaian, idx) => (
                              <tr key={`week-${weekNum}-penilaian-${idx + 1}`}>
                                <td className="border border-gray-300 p-2">
                                  {penilaian.kriteria || "-"}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  {penilaian.indikator || "-"}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  {penilaian.bobot || "-"}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      }

                      // For weeks without data
                      return (
                        <tr key={`week-${weekNum}`}>
                          <td className="border border-gray-300 p-2">
                            {weekNum}
                          </td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">-</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templatePenilaian">
            <TemplatePenilaianContent
              templates={mk?.templatePenilaianCPMK}
              mkId={mk?.kode}
              setRefresh={setRefresh}
            />
          </TabsContent>

          <TabsContent value="relasi">
            <Card className="w-[1000px] mx-auto">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
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
                  <SelectTrigger className="w-[250px] mb-5">
                    <SelectValue placeholder="Pilih CPMK/BK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPMK">CPMK</SelectItem>
                    <SelectItem value="BK">BK</SelectItem>
                  </SelectContent>
                </Select>
                {selectedRelasi === "CPMK" ? (
                  <>
                    <div className="flex flex-row items-center mb-5">
                      <input
                        type="text"
                        className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
                        value={searchCPMK}
                        placeholder="Cari..."
                        onChange={(e) => setSearchCPMK(e.target.value)}
                      />
                    </div>
                    {/* LIST OF MK */}
                    <div className="flex overflow-x-auto space-x-4 p-2">
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
                        <div className="text-sm">CPMK Tidak Ditemukan</div>
                      )}
                    </div>
                    {/* SAVE */}
                    <button
                      onClick={updateCPMK}
                      type="button"
                      className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={kunciSistem?.data}
                    >
                      Simpan
                    </button>
                  </>
                ) : selectedRelasi === "BK" ? (
                  <>
                    <div className="flex flex-row items-center mb-5">
                      <input
                        type="text"
                        className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
                        value={searchBK}
                        placeholder="Cari..."
                        onChange={(e) => setSearchBK(e.target.value)}
                      />
                    </div>
                    {/* LIST OF BK */}
                    <div className="flex overflow-x-auto space-x-4 p-2">
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
                        <div className="text-sm">BK Tidak Ditemukan</div>
                      )}
                    </div>
                    {/* SAVE */}
                    <button
                      onClick={updateBK}
                      type="button"
                      className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={kunciSistem?.data}
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
