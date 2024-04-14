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
});

const InputPenilaianCPMK = () => {
  const { toast } = useToast();

  const defaultValues = {
    MK: "",
    CPMK: "",
    CPL: "",
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>, e: any) {
    e.stopPropagation()
    form.reset(defaultValues);

    const data = {
      MK: values.MK,
      CPMK: values.CPMK,
      CPL: values.CPL,
    };

    axiosConfig
      .post("api/penilaianCPMK", data)
      .then(function (response) {
        if (response.data.status !== 400) {
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
  }

  return (
    <section className="flex h-screen mt-[-100px] justify-center items-center">
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
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                        {field.value ? <SelectValue placeholder="Select MK" /> : "Select MK"}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <p>Dummy Search Here</p>
                        <SelectItem value="MK1">MK 1</SelectItem>
                        <SelectItem value="MK2">MK 2</SelectItem>
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
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.getValues("MK")}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                        {field.value ? <SelectValue placeholder="Select CPMK" /> : "Select CPMK"}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <p>Dummy Search Here</p>
                        <SelectItem value="CPMK1">CPMK 1</SelectItem>
                        <SelectItem value="CPMK2">CPMK 2</SelectItem>
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
                        {field.value ? <SelectValue placeholder="Select CPL" /> : "Select CPL"}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <p>Dummy Search Here</p>
                        <SelectItem value="CPL1">CPL 1</SelectItem>
                        <SelectItem value="CPL2">CPL 2</SelectItem>
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
