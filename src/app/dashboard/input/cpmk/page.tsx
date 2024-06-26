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
import { useRouter } from "next/navigation";

const formSchema = z.object({
  kode: z.string().min(2).max(50),
  deskripsi: z.string().min(1).max(50),
});

const CPMKScreen = () => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      deskripsi: "",
    },
  });

  // AddCPMK
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: "CPMK-" + values.kode,
      deskripsi: values.deskripsi,
    };

    console.log(data.kode);

    axiosConfig
      .post("api/cpmk", data)
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

  return (
    <section className="flex h-screen mt-[-100px] justify-center items-center">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Input CPMK</CardTitle>
            <CardDescription>Capaian Pembelajaran Mata Kuliah</CardDescription>
          </div>
          <Button
            className="w-[100px] self-end"
            onClick={() => {
              router.push(`/dashboard/input/cpmk/excel`);
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
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode CPMK-</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kode"
                        type="number"
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

export default CPMKScreen;
