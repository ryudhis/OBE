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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getAccountData } from "@utils/api";
import { useState, useEffect } from "react";
import { accountProdi } from "@/app/interface/input";

const formSchema = z.object({
  kode: z.string().min(2).max(50),
  deskripsi: z.string().min(1).max(50),
  sks: z.string().min(1).max(50),
  batasLulusMahasiswa: z.string().min(1).max(50),
  batasLulusMK: z.string().min(1).max(50),
});

const MKScreen = () => {
  const { toast } = useToast();
  const [account, setAccount] = useState<accountProdi>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
      sks: "",
      batasLulusMahasiswa: "0",
      batasLulusMK: "0",
    },
  });

  // AddMK
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: values.kode,
      deskripsi: values.deskripsi,
      sks: values.sks,
      batasLulusMahasiswa: parseFloat(values.batasLulusMahasiswa),
      batasLulusMK: parseFloat(values.batasLulusMK),
      jumlahLulus: 0,
      prodiId: account?.prodiId,
    };

    axiosConfig
      .post("api/mk", data)
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
      });

    form.reset();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountData();
        setAccount(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="flex h-screen mt-[-100px] justify-center items-center">
      <Card className="w-[1000px]">
        <CardHeader>
          <CardTitle>Input MK</CardTitle>
          <CardDescription>Mata Kuliah</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode MK</FormLabel>
                    <FormControl>
                      <Input placeholder="Kode" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

export default MKScreen;
