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
  nama: z.string().min(1).max(50),
});

const InputProdi = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData }  = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: "",
      nama: "",
    },
  });

  // AddPL
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      kode: values.kode,
      nama: values.nama,
    };

    console.log(data);

    axiosConfig
      .post("api/prodi", data)
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

  if (accountData?.role !== "Super Admin") {
    toast({
      title: "Anda tidak memiliki akses untuk page input prodi.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className="flex justify-center items-center mt-20">
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Input Program Studi</CardTitle>
            <CardDescription>Buat Program Studi</CardDescription>
          </div>
          <Button
            className="w-[100px] self-end"
            onClick={() => {
              router.push(`/dashboard/input/pl/excel`);
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
                    <FormLabel>Kode Program Studi</FormLabel>
                    <FormControl>
                      <Input placeholder="Kode" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Program Studi</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama" required {...field} />
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

export default InputProdi;
