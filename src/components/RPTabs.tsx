"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import axiosConfig from "@utils/axios";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import RenderDataRP from "./RenderDataRP";

const SkeletonTable = ({ rows, cols }: { rows: number; cols: number }) => {
  return (
    <>
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i}>
            {Array(cols)
              .fill(0)
              .map((_, j) => (
                <td key={j} className='p-2'>
                  <div className='h-6 bg-gray-200 rounded animate-pulse'></div>
                </td>
              ))}
          </TableRow>
        ))}
    </>
  );
};

// Form schema for validation
const formSchema = z.object({
  minggu: z.string(),
  cpmk: z.string().min(1, "CPMK harus diisi"),
  materi: z.string().min(1, "Bahan kajian harus diisi"),
  bentuk: z.string().min(1, "Bentuk pembelajaran harus diisi"),
  metode: z.string().min(1, "Metode harus dipilih"),
  sumber: z.string().min(1, "Sumber belajar harus diisi"),
  waktu: z.string().min(1, "Waktu harus diisi"),
  pengalaman: z.string().min(1, "Pengalaman belajar harus diisi"),
  penilaian: z.array(
    z.object({
      kriteria: z.string().min(1, "Kriteria harus diisi"),
      indikator: z.string().min(1, "Indikator harus diisi"),
      bobot: z.string(),
    })
  ),
});

interface RencanaPembelajaranTabProps {
  templatePenilaian: TemplatePenilaianCPMK;
  isLoading?: boolean;
  setRefresh: Function;
}

export default function RencanaPembelajaranTab({
  templatePenilaian,
  isLoading = false,
  setRefresh,
}: RencanaPembelajaranTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCPMK, setSelectedCPMK] = useState<PenilaianCPMK | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minggu: "",
      cpmk: "",
      materi: "",
      bentuk: "",
      metode: "",
      sumber: "",
      waktu: "",
      pengalaman: "",
      penilaian: [{ kriteria: "", indikator: "", bobot: "" }],
    },
  });

  // Add Rencana Pembelajaran
  const onSubmitRP = async (values: z.infer<typeof formSchema>) => {
    if (!selectedCPMK) {
      toast({
        title: "Gagal Submit",
        description: "Silakan pilih CPMK terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    // 1. Build a map of allowed bobot per kriteria string
    const allowedBobotMap: Record<string, number> = {};
    selectedCPMK.kriteria.forEach((k) => {
      allowedBobotMap[k.kriteria] = k.bobot;
    });

    // 2. Sum existing bobot per kriteria string across all existing RencanaPembelajaran
    const existingBobotMap: Record<string, number> = {};
    templatePenilaian.rencanaPembelajaran.forEach((rp) => {
      if (rp.penilaianCPMKId === selectedCPMK.id) {
        rp.penilaianRP.forEach((p) => {
          const key = p.kriteria; // string name
          existingBobotMap[key] = (existingBobotMap[key] || 0) + p.bobot;
        });
      }
    });

    // 3. Check each new input doesn't exceed the allowed limit
    for (const item of values.penilaian) {
      const kriteriaStr = item.kriteria;
      const newBobot = Number(item.bobot);
      const allowed = allowedBobotMap[kriteriaStr] ?? 0;
      const existing = existingBobotMap[kriteriaStr] ?? 0;

      if (existing + newBobot > allowed) {
        toast({
          title: "Bobot melebihi batas",
          description: `Bobot untuk ${selectedCPMK.CPMK.kode} - Kriteria "${kriteriaStr}" melebihi batas maksimum ${allowed}%. (Sudah ada ${existing} %)`,
          variant: "destructive",
        });
        return;
      }
    }

    // Passed validation
    const data = {
      templatePenilaianCPMKId: templatePenilaian.id,
      minggu: parseInt(values.minggu),
      penilaianCPMKId: Number(values.cpmk),
      materi: values.materi,
      bentuk: values.bentuk,
      metode: values.metode,
      sumber: values.sumber,
      waktu: values.waktu,
      pengalaman: values.pengalaman,
      penilaian: values.penilaian.map((item) => ({
        ...item,
        bobot: Number(item.bobot),
      })),
    };

    try {
      const response = await axiosConfig.post("api/rencanaPembelajaran", data);
      if (response.data.status !== 400) {
        toast({
          title: "Berhasil Submit",
          description: String(new Date()),
        });
        form.reset();
        setSelectedCPMK(null);
      } else {
        toast({
          title: "Gagal Submit!",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Gagal Submit",
        description: error,
        variant: "destructive",
      });
      console.log(error);
    }

    setIsAddDialogOpen(false);
    setRefresh((prev: boolean) => !prev);
    return { success: true };
  };

  // Dummy function to delete all Rencana Pembelajaran
  const onDeleteAllRencana = async () => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus semua rencana pembelajaran?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
      axiosConfig
        .delete(`api/rencanaPembelajaran`, {
          data: { templatePenilaianCPMKId: templatePenilaian.id },
        })
        .then(function (response) {
          if (response.status === 200) {
            setRefresh((prev: boolean) => !prev);
            toast({
              title: "Berhasil hapus data",
              description: String(new Date()),
            });
          } else {
            toast({
              title: "Gagal hapus data!",
              description: String(new Date()),
              variant: "destructive",
            });
          }
        })
        .catch(function (error) {
          toast({
            title: "Gagal hapus data",
            description: String(new Date()),
            variant: "destructive",
          });
          console.log(error);
        });
    }
  };

  return (
    <>
      <Button
        className='w-[200px] self-end mr-32'
        variant='outline'
        onClick={() => setIsAddDialogOpen(true)}
      >
        Tambah Data
      </Button>

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Tambah Data</DialogTitle>
              <DialogDescription>Rencana Pembelajaran</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitRP)}
                className='space-y-4 max-h-[70vh] pr-2'
              >
                <FormField
                  control={form.control}
                  name='minggu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minggu</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih Minggu' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => i + 1)
                            .filter((num) => num !== 8)
                            .map((num) => (
                              <SelectItem key={num} value={String(num)}>
                                {num}
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
                  name='cpmk'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPMK</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("penilaian");
                          const selected = templatePenilaian.penilaianCPMK.find(
                            (cpmk) => String(cpmk.id) === value
                          );
                          setSelectedCPMK(selected ?? null);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih CPMK' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templatePenilaian.penilaianCPMK.map((cpmk) => (
                            <SelectItem key={cpmk.id} value={String(cpmk.id)}>
                              {cpmk.CPMK.kode}
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
                  name='materi'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bahan Kajian</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Bahan kajian...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='bentuk'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bentuk Pembelajaran</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih Bentuk Pembelajaran' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Kuliah Tatap Muka'>
                            Kuliah Tatap Muka
                          </SelectItem>
                          <SelectItem value='Kuliah Daring'>
                            Kuliah Daring
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='metode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih Metode' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Project Based Learning'>
                            Project Based Learning
                          </SelectItem>
                          <SelectItem value='Case Based Learning'>
                            Case Based Learning
                          </SelectItem>
                          <SelectItem value='Problem Based Learning'>
                            Problem Based Learning
                          </SelectItem>
                          <SelectItem value='Contextual Learning'>
                            Contextual Learning
                          </SelectItem>
                          <SelectItem value='Diskusi'>Diskusi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='sumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sumber Belajar</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Sumber belajar...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='waktu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu (menit)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih Waktu' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='TM: 2 x 50&#39;'>
                            TM: 2 x 50&#39;
                          </SelectItem>
                          <SelectItem value='TT: 2 x 60&#39;'>
                            TT: 2 x 60&#39;
                          </SelectItem>
                          <SelectItem value='TB: 2 x 60&#39;'>
                            TB: 2 x 60&#39;
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='pengalaman'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pengalaman Belajar</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Pengalaman belajar...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Penilaian Field Array */}
                <div className='space-y-2'>
                  <FormLabel>Penilaian</FormLabel>

                  {form.watch("penilaian").map((item, index) => (
                    <div
                      key={index}
                      className='flex flex-col gap-2 p-3 border rounded-md'
                    >
                      <div className='flex justify-between items-center'>
                        <h4 className='text-sm font-medium'>
                          Penilaian {index + 1}
                        </h4>
                        {index > 0 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              form.getValues("penilaian").length > 1 &&
                              form.setValue(
                                "penilaian",
                                form
                                  .getValues("penilaian")
                                  .filter((_, i) => i !== index)
                              )
                            }
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`penilaian.${index}.kriteria`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Kriteria</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!selectedCPMK}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Pilih Kriteria' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedCPMK?.kriteria.map((item) => (
                                  <SelectItem
                                    key={item.id}
                                    value={item.kriteria}
                                  >
                                    {item.kriteria}
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
                        name={`penilaian.${index}.indikator`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Indikator</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Indikator penilaian'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`penilaian.${index}.bobot`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-xs'>Bobot (%)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Bobot penilaian'
                                min='0'
                                max='100'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={() =>
                      form.setValue("penilaian", [
                        ...form.getValues("penilaian"),
                        { kriteria: "", indikator: "", bobot: "" },
                      ])
                    }
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Tambah Penilaian
                  </Button>
                </div>

                <div className='flex justify-end pt-2 pb-2'>
                  <Button
                    className='bg-blue-500 hover:bg-blue-600'
                    type='submit'
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {templatePenilaian &&
      templatePenilaian.rencanaPembelajaran.length !== 0 ? (
        <Card className='w-[1200px] mx-auto'>
          <CardHeader className='flex flex-row justify-between items-center'>
            <div className='flex flex-col'>
              <CardTitle>Rencana Pembelajaran</CardTitle>
              {templatePenilaian.MKId && (
                <CardDescription>
                  Mata Kuliah {templatePenilaian.MKId}
                </CardDescription>
              )}
            </div>
            <Button variant='destructive' onClick={onDeleteAllRencana}>
              Hapus Semua Data
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Minggu</TableHead>
                    <TableHead className='text-center'>CPMK</TableHead>
                    <TableHead className='text-center'>Bahan Kajian</TableHead>
                    <TableHead className='text-center'>Bentuk</TableHead>
                    <TableHead className='text-center'>Metode</TableHead>
                    <TableHead className='text-center'>Sumber</TableHead>
                    <TableHead className='text-center'>Waktu</TableHead>
                    <TableHead className='text-center'>Pengalaman</TableHead>
                    <TableHead className='w-[10%] text-center'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SkeletonTable rows={5} cols={8} />
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Minggu</TableHead>
                    <TableHead className='text-center'>CPMK</TableHead>
                    <TableHead className='text-center'>Bahan Kajian</TableHead>
                    <TableHead className='text-center'>Bentuk</TableHead>
                    <TableHead className='text-center'>Metode</TableHead>
                    <TableHead className='text-center'>Sumber</TableHead>
                    <TableHead className='text-center'>Waktu</TableHead>
                    <TableHead className='text-center'>Pengalaman</TableHead>
                    <TableHead className='w-[10%] text-center'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <RenderDataRP
                    templatePenilaian={templatePenilaian}
                    setRefresh={setRefresh}
                  />
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className='self-center'>Belum Ada Rencana Pembelajaran ...</p>
      )}
    </>
  );
}
