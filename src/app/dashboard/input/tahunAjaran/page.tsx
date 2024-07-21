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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAccount } from "@/app/contexts/AccountContext";

const formSchema = z.object({
  tahun: z.string().min(2).max(50),
  semester: z.string().min(1).max(50),
});

const InputProdi = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { accountData }  = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tahun: "",
      semester: "",
    },
  });

  // AddPL
  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.preventDefault();

    const data = {
      tahun: values.tahun,
      semester: values.semester,
    };

    console.log(data);

    axiosConfig
      .post("api/tahun-ajaran", data)
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
      title: "Anda tidak memiliki akses untuk page input tahun ajaran.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const generateTahunAjaran = (startYear: number, endYear: number) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(`${year}/${year + 1}`);
    }
    return years;
  };

  // Generate years from 2024 to 2030
  const tahunAjaran = generateTahunAjaran(2024, 2034);

  return (
    <section className='flex h-screen mt-[-100px] justify-center items-center'>
      <Card className='w-[1000px]'>
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>Input Tahun Ajaran</CardTitle>
            <CardDescription>Tahun Ajaran Baru</CardDescription>
          </div>
          {/* <Button
            className="w-[100px] self-end"
            onClick={() => {
              router.push(`/dashboard/input/pl/excel`);
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
                name='tahun'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Tahun' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tahunAjaran.map((tahun) => (
                          <SelectItem key={tahun} value={tahun}>
                            {tahun}
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
                name='semester'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih Semester' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"Ganjil"}>Ganjil</SelectItem>
                        <SelectItem value={"Genap"}>Genap</SelectItem>
                      </SelectContent>
                    </Select>
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

export default InputProdi;
