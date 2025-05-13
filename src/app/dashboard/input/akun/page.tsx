"use client";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  nama: z.string().min(5).max(60),
  email: z.string().min(5).max(50),
  password: z.string().min(6).max(20),
  role: z.string().min(0).max(10),
  prodi: z.string().min(0).max(30),
});

const InputAkun = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const { accountData } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      role: "",
      prodi: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      nama: values.nama,
      email: values.email,
      password: values.password,
      role: values.role,
      prodiId: values.prodi,
    };

    axiosConfig
      .post("api/account/register", data)
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

  const getProdi = async () => {
    try {
      const response = await axiosConfig.get(`api/prodi`);
      if (response.data.status !== 400) {
        setProdi(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProdi();
  }, []);

  if (accountData?.role !== "Super Admin") {
    toast({
      title: "Anda tidak memiliki akses untuk page input akun.",
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
            <CardTitle>Daftar Akun</CardTitle>
            <CardDescription>Buat akun baru</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama"
                        type="text"
                        min={5}
                        max={60}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        min={5}
                        max={50}
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                        type="password"
                        min={6}
                        max={20}
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
                name="prodi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prodi:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih Prodi" />
                          ) : (
                            "Pilih Prodi"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prodi.map((data) => (
                          <SelectItem key={data.kode} value={data.kode}>
                            {data.nama}
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role akun:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Pilih Role" />
                          ) : (
                            "Pilih Role"
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="GKMP">GKMP</SelectItem>
                        <SelectItem value="Kaprodi">Kaprodi</SelectItem>
                        <SelectItem value="Dosen">Dosen</SelectItem>
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

export default InputAkun;
