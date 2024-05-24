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

export interface PCPMKItem {
  kode: string;
  MK: string;
  kriteria: { kriteria: string; bobot: number }[];
}

export interface MKItem {
  kode: string;
  kelas: kelasItem[];
}

export interface kelasItem {
  id: number;
  nama: string;
  MKId: string;
  mahasiswa: mahasiswaItem[];
}

export interface mahasiswaItem {
  nim: string;
  nama: string;
}

const InputNilai: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [PCPMK, setPCPMK] = useState<PCPMKItem[]>([]);
  const [MK, setMK] = useState<MKItem[]>([]);
  const [selectedMK, setSelectedMK] = useState<MKItem | undefined>();
  const [selectedKelas, setSelectedKelas] = useState<kelasItem | undefined>();
  const [selectedPCPMK, setSelectedPCPMK] = useState<PCPMKItem | undefined>();
  const [searchMK, setSearchMK] = useState<string>("");
  const [searchPCPMK, setSearchPCPMK] = useState<string>("");

  const filteredMK = MK.filter((mk) =>
    mk.kode.toLowerCase().includes(searchMK.toLowerCase())
  );

  const filteredPCPMK = PCPMK.filter((pcpmk) =>
    pcpmk.kode.toLowerCase().includes(searchPCPMK.toLowerCase())
  );

  const getPCPMK = async () => {
    try {
      const response = await axiosConfig.get("api/penilaianCPMK");
      if (response.data.status !== 400) {
        setPCPMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMK = async () => {
    try {
      const response = await axiosConfig.get("api/mk");
      if (response.data.status !== 400) {
        setMK(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
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
      PCPMKId: values.PCPMK,
      MahasiswaId: item.mahasiswa,
      nilai: item.nilai.map((nilai) => parseFloat(nilai)),
    }));

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
  };

  useEffect(() => {
    getPCPMK();
  }, []);

  useEffect(() => {
    getMK();
  }, []);

  return (
    <section className="flex my-[50px] justify-center items-center">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Input Nilai</CardTitle>
            <CardDescription>Nilai PCPMK</CardDescription>
          </div>
          <Button
            className="w-[100px] self-end"
            onClick={() => {
              router.push(`/dashboard/input/nilai/excel`);
            }}
          >
            Input Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="MK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedMK(MK.find((mk) => mk.kode === value));
                        form.resetField("kelas");
                        form.resetField("PCPMK");
                        form.resetField("nilai");
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih MK" />
                          ) : (
                            "Pilih MK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type="text"
                          className="mb-2"
                          value={searchMK}
                          placeholder="Cari..."
                          onChange={(e) => setSearchMK(e.target.value)}
                        />
                        {filteredMK.map((mk, index) => (
                          <SelectItem key={index} value={mk.kode}>
                            {mk.kode}
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
                name="kelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedKelas(
                          selectedMK?.kelas.find(
                            (kelas) => kelas.nama === value
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
                            <SelectValue placeholder="Pilih Kelas" />
                          ) : (
                            "Pilih Kelas"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedMK?.kelas.map((kelas, index) => (
                          <SelectItem key={index} value={kelas.nama}>
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
                name="PCPMK"
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
                            <SelectValue placeholder="Pilih PCPMK" />
                          ) : (
                            "Pilih PCPMK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type="text"
                          className="mb-2"
                          value={searchPCPMK}
                          placeholder="Cari..."
                          onChange={(e) => setSearchPCPMK(e.target.value)}
                        />
                        {filteredPCPMK
                          .filter((pcpmk) => pcpmk.MK === selectedMK?.kode)
                          .map((pcpmk, index) => (
                            <SelectItem key={index} value={pcpmk.kode}>
                              {pcpmk.kode}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedKelas && selectedPCPMK && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border">NIM</th>
                        <th className="py-2 px-4 border">Nama</th>
                        {selectedPCPMK.kriteria.map((kriteria, kIndex) => (
                          <th key={kIndex} className="py-2 px-4 border">
                            {kriteria.kriteria}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedKelas.mahasiswa.map((mahasiswa, mIndex) => (
                        <tr key={mIndex} className="border-t">
                          <td className="py-2 px-4 border">{mahasiswa.nim}</td>
                          <td className="py-2 px-4 border">{mahasiswa.nama}</td>
                          {selectedPCPMK.kriteria.map((kriteria, kIndex) => (
                            <td key={kIndex} className="py-2 px-4 border">
                              <FormField
                                control={form.control}
                                name={
                                  `nilai.${mIndex}.nilai.${kIndex}` as const
                                }
                                render={({ field }) => (
                                  <FormItem className="m-0">
                                    <Input
                                      placeholder="Nilai"
                                      type="number"
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

              <Button className="bg-blue-500 hover:bg-blue-600" type="submit">
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
