"use client";
import axiosConfig from "@utils/axios";
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
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";

const formSchema = z.object({
  kode: z.string().min(1).max(50),
  deskripsi: z.string().min(1).max(50),
  keterangan: z.string().min(1).max(50),
  deskripsiInggris: z.string().min(1).max(50),
});

const CPLScreen = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData } = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
      keterangan: "",
      deskripsiInggris: "",
    },
  });

  // AddCPL
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: "CPL-" + values.kode,
      deskripsi: values.deskripsi,
      keterangan: values.keterangan,
      deskripsiInggris: values.deskripsiInggris,
      prodiId: accountData?.prodiId,
    };

    axiosConfig
      .post("api/cpl", data)
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

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input cpl.",
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
            <CardTitle>Input CPL</CardTitle>
            <CardDescription>Capaian Pembelajaran</CardDescription>
          </div>
          <Button
            className='w-[100px] self-end'
            onClick={() => {
              router.push(`/dashboard/input/cpl/excel`);
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
                name='kode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode CPL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Kode CPL'
                        type='number'
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

              <FormField
                control={form.control}
                name='deskripsiInggris'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Inggris</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Deskripsi dalam Bahasa Inggris'
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
                name='keterangan'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder='Keterangan' required {...field} />
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

export default CPLScreen;
