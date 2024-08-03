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
  kode: z.string().min(2).max(50),
  deskripsi: z.string().min(1).max(50),
  min: z.string().min(0).max(10),
  max: z.string().min(0).max(10),
});

const BKScreen = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData } = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
      min: "0",
      max: "0",
    },
  });

  // AddBK
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: "BK-" + values.kode,
      deskripsi: values.deskripsi,
      min: parseInt(values.min),
      max: parseInt(values.max),
      prodiId: accountData?.prodiId,
    };

    axiosConfig
      .post("api/bk", data)
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

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input bk.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className='flex h-screen mt-[-100px] justify-center items-center'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>Input BK</CardTitle>
            <CardDescription>Bahan Kajian</CardDescription>
          </div>
          <Button
            className='w-[100px] self-end'
            onClick={() => {
              router.push(`/dashboard/input/bk/excel`);
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
                    <FormLabel>Kode BK</FormLabel>
                    <FormControl>
                      <Input placeholder='Kode BK' type="number" required {...field} />
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
                name='min'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal MK</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='min'
                        type='number'
                        min={0}
                        max={10}
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
                name='max'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimal MK</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='max'
                        type='number'
                        min={0}
                        max={10}
                        required
                        {...field}
                      />
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

export default BKScreen;
