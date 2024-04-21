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
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

const formSchema = z.object({
  MK: z
    .string({
      required_error: "Please select MK to display.",
    })
    .optional(),
  CPMK: z
    .string({
      required_error: "Please select CPMK to display.",
    })
    .optional(),
  CPL: z
    .string({
      required_error: "Please select CPL to display.",
    })
    .optional(),
  tahapPenilaian: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  teknikPenilaian: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  instrumen: z
    .string({
      required_error: "Please select Instrumen to display.",
    })
    .optional(),
});

export interface MKItem {
  kode: string;
  deskripsi: string;
  CPMK: CPMKItem[];
}

export interface CPMKItem {
  kode: string;
  CPL: CPLItem[];
}

export interface CPLItem {
  kode: string;
}

const InputPenilaianCPMK = () => {
  const { toast } = useToast();
  const [MK, setMK] = useState<MKItem[]>([]);
  const [selectedMK, setSelectedMK] = useState<MKItem>();
  const [selectedCPMK, setSelectedCPMK] = useState<CPMKItem>();

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

  const tahapPenilaian = [
    {
      id: "tahap1",
      label: "Tahap1",
    },
    {
      id: "tahap2",
      label: "Tahap2",
    },
    {
      id: "tahap3",
      label: "Tahap3",
    },
  ] as const;

  const teknikPenilaian = [
    {
      id: "teknik1",
      label: "Teknik1",
    },
    {
      id: "teknik2",
      label: "Teknik2",
    },
    {
      id: "teknik3",
      label: "Teknik3",
    },
  ] as const;

  const defaultValues = {
    MK: "",
    CPMK: "",
    CPL: "",
    tahapPenilaian: [],
    teknikPenilaian: [],
    Instrumen: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation();

    const data = {
      MK: values.MK,
      CPMK: values.CPMK,
      CPL: values.CPL,
      tahapPenilaian: values.tahapPenilaian,
      teknikPenilaian: values.teknikPenilaian,
    };

    console.log(data);

    form.reset(defaultValues);
    // axiosConfig
    //   .post("api/penilaianCPMK", data)
    //   .then(function (response) {
    //     if (response.data.status !== 400) {
    //       toast({
    //         title: "Berhasil Submit",
    //         description: String(new Date()),
    //       });
    //     } else {
    //       toast({
    //         title: "Kode Sudah Ada!",
    //         description: String(new Date()),
    //         variant: "destructive",
    //       });
    //     }
    //   })
    //   .catch(function (error) {
    //     toast({
    //       title: "Gagal Submit",
    //       description: String(new Date()),
    //       variant: "destructive",
    //     });
    //     console.log(error);
    //   });
  }

  useEffect(() => {
    getMK();
  }, []);

  return (
    <section className="flex h-screen justify-center items-center">
      <Card className="w-[1000px]">
        <CardHeader>
          <CardTitle>Input </CardTitle>
          <CardDescription>Penilaian CPMK</CardDescription>
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
                        form.resetField("CPMK");
                        form.resetField("CPL");
                        setSelectedMK(MK.find((mk) => mk.kode === value));
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
                        <p>Dummy Search Here</p>
                        {MK?.map((mk, index) => {
                          return (
                            <SelectItem key={index} value={mk.kode}>
                              {mk.kode}
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
                name="CPMK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPMK</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.resetField("CPL");
                        setSelectedCPMK(
                          selectedMK?.CPMK.find((cpmk) => cpmk.kode === value)
                        );
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("MK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih CPMK" />
                          ) : (
                            "Pilih CPMK"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <p>Dummy Search Here</p>
                        {selectedMK?.CPMK.map((cpmk, index) => {
                          return (
                            <SelectItem key={index} value={cpmk.kode}>
                              {cpmk.kode}
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
                name="CPL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPL</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("CPMK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih CPL" />
                          ) : (
                            "Pilih CPL"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <p>Dummy Search Here</p>
                        {selectedCPMK?.CPL.map((cpl, index) => {
                          return (
                            <SelectItem key={index} value={cpl.kode}>
                              {cpl.kode}
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
                name="tahapPenilaian"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Tahap Penilaian :
                      </FormLabel>
                    </div>
                    {tahapPenilaian.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="tahapPenilaian"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teknikPenilaian"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Teknik Penilaian :
                      </FormLabel>
                    </div>
                    {teknikPenilaian.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="teknikPenilaian"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instrumen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrumen</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih Instrumen" />
                          ) : (
                            "Pilih Instrumen"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rubrik">Rubrik</SelectItem>
                        <SelectItem value="Panduan Proyek Akhir">
                          Panduan Proyek Akhir
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

export default InputPenilaianCPMK;
