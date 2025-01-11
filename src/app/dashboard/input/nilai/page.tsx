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
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  MK: z.string({
    required_error: "Please select MK to display.",
  }),
  kelas: z.string({
    required_error: "Please select kelas to display.",
  }),
  PCPMK: z.string({
    required_error: "Please select PCPMK to display.",
  }),
  nilai: z.array(
    z.object({
      mahasiswa: z.string(),
      nilai: z.array(z.string()),
    })
  ),
});

const InputNilai: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData } = useAccount();
  const [MK, setMK] = useState<MK[]>([]);
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const [selectedMK, setSelectedMK] = useState<MK | undefined>();
  const [selectedKelas, setSelectedKelas] = useState<Kelas | undefined>();
  const [selectedPCPMK, setSelectedPCPMK] = useState<PenilaianCPMK | undefined>();
  const [searchMK, setSearchMK] = useState<string>("");
  const [searchPCPMK, setSearchPCPMK] = useState<string>("");
  const [selectedTahun, setSelectedTahun] = useState("");
  let PCPMK: PenilaianCPMK[] = [];
  let filteredPCPMK: PenilaianCPMK[] = [];

  if (selectedMK) {
    console.log(selectedMK);
    PCPMK = selectedMK.penilaianCPMK;
    console.log(PCPMK);
  }

  const filteredMK = MK.filter((mk) =>
    mk.kode.toLowerCase().includes(searchMK.toLowerCase())
  );

  console.log(MK);

  if (PCPMK.length !== 0) {
    filteredPCPMK = PCPMK.filter((pcpmk) =>
      pcpmk.kode.toLowerCase().includes(searchPCPMK.toLowerCase())
    );
  }

  const getMK = async (accountData: Account, tahunId: string) => {
    try {
      // Filter the MKIds based on the matching tahunId
      const userMKIds: string[] = accountData.kelas
        .filter((kelas) => kelas.tahunAjaran.id === parseInt(tahunId))
        .map((kelas) => kelas.MKId);

      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData.prodiId}&limit=99999`
      );
      if (response.data.status !== 400) {
        const filteredMK = response.data.data.filter((mk: MK) =>
          userMKIds.includes(mk.kode)
        );

        setMK(filteredMK);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran?limit=99999`);
      if (response.data.status !== 400) {
        setTahunAjaran(response.data.data);
        setSelectedTahun(String(response.data.data[0].id));
        if (accountData) {
          getMK(accountData, response.data.data[0].id);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const defaultValues = {
    MK: "",
    kelas: "",
    PCPMK: "",
    nilai: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = values.nilai.map((item) => ({
      MKId: values.MK,
      kelasId: selectedKelas?.id,
      PCPMKId: selectedPCPMK?.id,
      MahasiswaId: item.mahasiswa,
      nilai: item.nilai.map((nilai) => parseFloat(nilai)),
      prodiId: accountData?.prodiId,
    }));

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
    setSelectedKelas(undefined);
    setSelectedPCPMK(undefined);
    setSearchPCPMK("");
  };

  const handleTahunChange = (value: string) => {
    setSelectedTahun(value);
  };

  useEffect(() => {
    try {
      if (accountData?.prodiId) {
        getTahunAjaran();
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (accountData?.role === "Admin Prodi") {
    toast({
      title: "Anda tidak memiliki akses untuk page input nilai.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className='flex justify-center items-center mt-20 mb-10'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>Input Nilai</CardTitle>
            <CardDescription>Nilai PCPMK</CardDescription>
          </div>
          {/* <Button
            className="w-[100px] self-end"
            onClick={() => {
              router.push(`/dashboard/input/nilai/excel`);
            }}
          >
            Input Excel
          </Button> */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='MK'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Ajaran</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        handleTahunChange(value);
                        form.resetField("MK");
                        form.resetField("kelas");
                        form.resetField("PCPMK");
                        form.resetField("nilai");
                        setSelectedMK(undefined);
                        setSelectedKelas(undefined);
                        setSelectedPCPMK(undefined);
                        if (accountData) {
                          getMK(accountData, value);
                        }
                      }}
                      value={selectedTahun}
                    >
                      <SelectTrigger>
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

                    <FormLabel>MK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedMK(MK.find((mk) => mk.kode === value));
                        form.resetField("kelas");
                        form.resetField("PCPMK");
                        form.resetField("nilai");
                        setSelectedKelas(undefined);
                        setSelectedPCPMK(undefined);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      required
                      disabled={!selectedTahun}
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
                          type='text'
                          className='mb-2'
                          value={searchMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchMK(e.target.value)}
                        />
                        {filteredMK.map((mk, index) => (
                          <SelectItem key={index} value={mk.kode}>
                            {mk.kode + " - " + mk.deskripsi}
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
                name='kelas'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedKelas(
                          selectedMK?.kelas.find(
                            (kelas) => kelas.id === parseInt(value)
                          )
                        );
                        form.resetField("nilai");
                      }}
                      disabled={!form.getValues("MK")}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder='Pilih Kelas' />
                          ) : (
                            "Pilih Kelas"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedMK?.kelas
                          .filter((kelas) =>
                            accountData?.kelas.some(
                              (accKelas) => accKelas.id === kelas.id
                            )
                          )
                          .filter(
                            (kelas) =>
                              kelas.tahunAjaran.id === parseInt(selectedTahun)
                          )
                          .map((kelas) => (
                            <SelectItem key={kelas.id} value={String(kelas.id)}>
                              {kelas.nama}
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
                        form.resetField("nilai");
                      }}
                      disabled={!form.getValues("MK")}
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
                          type='text'
                          className='mb-2'
                          value={searchPCPMK}
                          placeholder='Cari...'
                          onChange={(e) => setSearchPCPMK(e.target.value)}
                        />
                        {filteredPCPMK.map((pcpmk, index) => (
                          <SelectItem key={index} value={pcpmk.kode}>
                            {pcpmk.CPMK.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedKelas && selectedPCPMK && (
                <div className='overflow-x-auto'>
                  <table className='min-w-full bg-white border'>
                    <thead>
                      <tr>
                        <th className='py-2 px-4 border'>NIM</th>
                        <th className='py-2 px-4 border'>Nama</th>
                        {selectedPCPMK.kriteria.map((kriteria, kIndex) => (
                          <th key={kIndex} className='py-2 px-4 border'>
                            {kriteria.kriteria}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedKelas.mahasiswa.map((mahasiswa, mIndex) => (
                        <tr key={mIndex} className='border-t'>
                          <td className='py-2 px-4 border'>{mahasiswa.nim}</td>
                          <td className='py-2 px-4 border'>{mahasiswa.nama}</td>
                          {selectedPCPMK.kriteria.map((kriteria, kIndex) => (
                            <td key={kIndex} className='py-2 px-4 border'>
                              <FormField
                                control={form.control}
                                name={
                                  `nilai.${mIndex}.nilai.${kIndex}` as const
                                }
                                render={({ field }) => (
                                  <FormItem className='m-0'>
                                    <Input
                                      placeholder='Nilai'
                                      type='number'
                                      min={0}
                                      max={100}
                                      required
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const updatedNilaiArray = [
                                          ...(form.getValues(
                                            `nilai.${mIndex}.nilai`
                                          ) || []),
                                        ];
                                        updatedNilaiArray[kIndex] =
                                          e.target.value;
                                        form.setValue(
                                          `nilai.${mIndex}.nilai`,
                                          updatedNilaiArray
                                        );
                                        form.setValue(
                                          `nilai.${mIndex}.mahasiswa`,
                                          mahasiswa.nim
                                        );
                                      }}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
