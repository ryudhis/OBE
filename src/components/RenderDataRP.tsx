"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import axiosConfig from "@utils/axios";
import { useToast } from "@/components/ui/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";

// Form schema for edit validation
const editFormSchema = z.object({
  editMinggu: z.string().min(1).max(12),
  editCPMK: z.string().min(1, "CPMK harus dipilih"),
  editBahanKajian: z.string().min(1, "Bahan kajian harus diisi"),
  editBentuk: z.string().min(1, "Bentuk pembelajaran harus diisi"),
  editMetode: z.string().min(1, "Metode harus dipilih"),
  editSumber: z.string().min(1, "Sumber belajar harus diisi"),
  editWaktu: z.string().min(1, "Waktu harus diisi"),
  editPengalaman: z.string().min(1, "Pengalaman belajar harus diisi"),
  editPenilaian: z.array(
    z.object({
      id: z.number().optional(),
      kriteria: z.string().min(1, "Kriteria harus diisi"),
      indikator: z.string().min(1, "Indikator harus diisi"),
      bobot: z.coerce.string(),
    })
  ),
});

interface RenderDataRPProps {
  templatePenilaian: TemplatePenilaianCPMK;
  setRefresh: Function;
}

const RenderDataRP = ({ templatePenilaian, setRefresh }: RenderDataRPProps) => {
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedCPMK, setSelectedCPMK] = useState<PenilaianCPMK | null>(null);
  const [selectedRencanaId, setSelectedRencanaId] = useState<number | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Initialize edit form with react-hook-form
  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      editMinggu: "",
      editCPMK: "",
      editBahanKajian: "",
      editBentuk: "",
      editMetode: "",
      editSumber: "",
      editWaktu: "",
      editPengalaman: "",
      editPenilaian: [{ kriteria: "", indikator: "", bobot: "" }],
    },
  });

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Function to handle selecting a rencana for editing
  const handleSelectForEdit = (rencana: RencanaPembelajaran) => {
    setSelectedRencanaId(rencana.id);
    setSelectedCPMK(rencana.penilaianCPMK);

    // Populate the edit form with the selected rencana data
    editForm.reset({
      editMinggu: String(rencana.minggu),
      editCPMK: String(rencana.penilaianCPMKId),
      editBahanKajian: rencana.bahanKajian,
      editBentuk: rencana.bentuk,
      editMetode: rencana.metode,
      editSumber: rencana.sumber,
      editWaktu: rencana.waktu,
      editPengalaman: rencana.pengalaman,
      editPenilaian: rencana.penilaianRP.map((p) => ({
        id: p.id,
        kriteria: p.kriteria,
        indikator: p.indikator,
        bobot: String(p.bobot),
      })),
    });

    setIsEditDialogOpen(true);
  };

  // Edit Rencana Pembelajaran
  const editRencana = async (values: z.infer<typeof editFormSchema>) => {
    if (!selectedRencanaId || !selectedCPMK) return;

    // Validate bobot for the selected CPMK
    const allowedBobotMap: Record<string, number> = {};
    selectedCPMK.kriteria.forEach((k) => {
      allowedBobotMap[k.kriteria] = k.bobot;
    });

    // Calculate existing bobot for the same CPMK
    const existingBobotMap: Record<string, number> = {};
    templatePenilaian.rencanaPembelajaran.forEach((rp) => {
      if (rp.id === selectedRencanaId) return; // skip the edited record
      if (rp.penilaianCPMKId === selectedCPMK.id) {
        rp.penilaianRP.forEach((p) => {
          const key = p.kriteria;
          existingBobotMap[key] = (existingBobotMap[key] || 0) + p.bobot;
        });
      }
    });

    for (const item of values.editPenilaian) {
      const kriteriaStr = item.kriteria;
      const newBobot = Number(item.bobot);
      const allowed = allowedBobotMap[kriteriaStr] ?? 0;
      const existing = existingBobotMap[kriteriaStr] ?? 0;

      if (existing + newBobot > allowed) {
        console.log(selectedCPMK);
        toast({
          title: "Bobot melebihi batas",
          description: `Bobot untuk ${selectedCPMK.CPMK.kode} - Kriteria "${kriteriaStr}" melebihi batas maksimum ${allowed}%. (Sudah ada ${existing} %)`,
          variant: "destructive",
        });
        return;
      }
    }

    const data = {
      id: selectedRencanaId,
      minggu: parseInt(values.editMinggu),
      penilaianCPMKId: Number(values.editCPMK),
      bahanKajian: values.editBahanKajian,
      bentuk: values.editBentuk,
      metode: values.editMetode,
      sumber: values.editSumber,
      waktu: values.editWaktu,
      pengalaman: values.editPengalaman,
      penilaian: values.editPenilaian.map((item) => ({
        id: item.id ?? null, // keep id when available
        kriteria: item.kriteria,
        indikator: item.indikator,
        bobot: Number(item.bobot),
      })),
    };

    try {
      const response = await axiosConfig.patch(
        `api/rencanaPembelajaran/${selectedRencanaId}`,
        data
      );

      if (response.data.status !== 400) {
        toast({
          title: "Berhasil Update",
          description: String(new Date()),
        });
      } else {
        toast({
          title: "Gagal Update!",
          description: response.data.message,
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      toast({
        title: "Gagal Update",
        description: error,
        variant: "destructive",
      });
      console.error(error);
      return;
    }

    setIsEditDialogOpen(false);
    setRefresh((prev: boolean) => !prev);
    return { success: true };
  };

  // Dummy function to delete a Rencana Pembelajaran
  const delRencana = async (id: number) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus rencana pembelajaran ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
      axiosConfig
        .delete(`api/rencanaPembelajaran/${id}`)
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

  // Render the table rows
  const tableRows = templatePenilaian.rencanaPembelajaran.flatMap((rencana) => {
    const isExpanded = expandedRows[rencana.id] || false;

    // Main row
    const mainRow = (
      <TableRow key={rencana.id} className='border-b-0'>
        <TableCell className='text-center'>
          <div className='flex items-center justify-center'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 mr-1'
              onClick={() => toggleRow(rencana.id)}
            >
              {isExpanded ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
            </Button>
            {rencana.minggu}
          </div>
        </TableCell>
        <TableCell>{rencana.bahanKajian}</TableCell>
        <TableCell>{rencana.bentuk}</TableCell>
        <TableCell className='text-center'>{rencana.metode}</TableCell>
        <TableCell>{rencana.sumber}</TableCell>
        <TableCell className='text-center'>{rencana.waktu}</TableCell>
        <TableCell>{rencana.pengalaman}</TableCell>
        <TableCell className='text-center'>
          <div className='flex gap-2 justify-center'>
            <Button
              onClick={() => handleSelectForEdit(rencana)}
              variant='outline'
              size='sm'
            >
              Edit
            </Button>

            <Button
              variant='destructive'
              size='sm'
              onClick={() => delRencana(rencana.id)}
            >
              Hapus
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );

    // If row is expanded, add the penilaian details row
    if (isExpanded && rencana.penilaianRP && rencana.penilaianRP.length > 0) {
      const penilaianRow = (
        <TableRow key={`${rencana.id}-penilaian`} className='bg-gray-50'>
          <TableCell colSpan={8} className='p-0'>
            <div className='p-4 pl-12'>
              <h4 className='text-sm font-medium mb-3'>Penilaian</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {rencana.penilaianRP.map((penilaian, index) => (
                  <div key={index} className='border rounded-md p-3 bg-white'>
                    <div className='flex justify-between items-center mb-2'>
                      <h5 className='text-sm font-medium'>
                        Penilaian {index + 1}
                      </h5>
                      <Badge variant='outline'>{penilaian.bobot}%</Badge>
                    </div>
                    <div className='space-y-2'>
                      <div>
                        <h6 className='text-xs font-medium text-gray-500'>
                          Kriteria:
                        </h6>
                        <p className='text-sm'>{penilaian.kriteria}</p>
                      </div>
                      <div>
                        <h6 className='text-xs font-medium text-gray-500'>
                          Indikator:
                        </h6>
                        <p className='text-sm'>{penilaian.indikator}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      );

      return [mainRow, penilaianRow];
    }

    return [mainRow];
  });

  return (
    <>
      {tableRows}

      {/* Edit Dialog - Completely separate from the table rendering */}
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Edit Data</DialogTitle>
              <DialogDescription>Rencana Pembelajaran</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(editRencana)}
                className='space-y-4 max-h-[70vh] pr-2'
              >
                <FormField
                  control={editForm.control}
                  name='editMinggu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minggu</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          max={12}
                          placeholder='Minggu ke-'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name='editCPMK'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPMK</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          editForm.resetField("editPenilaian");
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
                  control={editForm.control}
                  name='editBahanKajian'
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
                  control={editForm.control}
                  name='editBentuk'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bentuk Pembelajaran</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Bentuk pembelajaran...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name='editMetode'
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
                  control={editForm.control}
                  name='editSumber'
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
                  control={editForm.control}
                  name='editWaktu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu (menit)</FormLabel>
                      <FormControl>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name='editPengalaman'
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

                  {editForm.watch("editPenilaian").map((item, index) => (
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
                              editForm.getValues("editPenilaian").length > 1 &&
                              editForm.setValue(
                                "editPenilaian",
                                editForm
                                  .getValues("editPenilaian")
                                  .filter((_, i) => i !== index)
                              )
                            }
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={editForm.control}
                        name={`editPenilaian.${index}.kriteria`}
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
                        control={editForm.control}
                        name={`editPenilaian.${index}.indikator`}
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
                        control={editForm.control}
                        name={`editPenilaian.${index}.bobot`}
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
                      editForm.setValue("editPenilaian", [
                        ...editForm.getValues("editPenilaian"),
                        { kriteria: "", indikator: "", bobot: "" },
                      ])
                    }
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Tambah Penilaian
                  </Button>
                </div>

                <div className='flex justify-end pt-4 pb-2'>
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
    </>
  );
};

export default RenderDataRP;
