"use client";
import axiosConfig from "@/utils/axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";
import React, { useEffect, useState } from "react";

const formSchema = z.object({
  kode: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(50),
  CPL: z.string({ required_error: "Please select CPL to display." }),
});

const CPMKScreen = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData } = useAccount();
  const [CPL, setCPL] = useState<CPL[]>([]);
  const [searchCPL, setSearchCPL] = useState<string>("");

  const filteredCPL = CPL.filter((cpl) =>
    cpl.kode.toLowerCase().includes(searchCPL.toLowerCase())
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
      CPL: "",
    },
  });

  const getCPL = async (prodiId: string = "") => {
    try {
      const response = await axiosConfig.get(`api/cpl?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setCPL(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  // AddCPMK
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const extractNumber = (str: string) => str.match(/\d+/)?.[0] || "";

    const cplNumber = extractNumber(values.CPL);

    const data = {
      kode: "CPMK-" + cplNumber + values.kode,
      deskripsi: values.deskripsi,
      CPLId: values.CPL,
      prodiId: accountData?.prodiId,
    };

    axiosConfig
      .post("api/cpmk", data)
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
  }

  useEffect(() => {
    getCPL(accountData?.prodiId);
  }, [accountData?.prodiId]);

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input cpmk.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className='flex justify-center items-center mt-20'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>Input CPMK</CardTitle>
            <CardDescription>Capaian Pembelajaran Mata Kuliah</CardDescription>
          </div>
          <Button
            className='w-[100px] self-end'
            onClick={() => {
              router.push(`/dashboard/input/cpmk/excel`);
            }}
          >
            Input Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='CPL'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPL</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih CPL' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input
                          type='text'
                          className='mb-2'
                          value={searchCPL}
                          placeholder='Cari...'
                          onChange={(e) => setSearchCPL(e.target.value)}
                        />
                        {filteredCPL?.map((item) => (
                          <SelectItem key={item.kode} value={item.kode}>
                            {item.kode}
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
                name='kode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode CPMK-</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Kode'
                        required
                        type='number'
                        {...field}
                      />
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
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Input placeholder='Deskripsi' required {...field} />
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

export default CPMKScreen;
