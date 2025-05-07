"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axiosConfig from "@/utils/axios";
import { toast } from "@/components/ui/use-toast";
import Swal from "sweetalert2";

// Types based on the schema
export interface Kriteria {
  bobot: number;
  kriteria: string;
}

export interface PenilaianCPMK {
  id: number;
  kode: string;
  CPLkode: number;
  MKkode: string;
  CPMKkode: number;
  tahapPenilaian: string;
  teknikPenilaian: string;
  instrumen: string;
  batasNilai: number;
  kriteria: Kriteria[];
  prodiId: string;
  templatePenilaianCPMKId: number;
}

export interface TemplatePenilaianCPMK {
  id: number;
  template: string;
  active: boolean;
  MKId: string;
  penilaianCPMK: PenilaianCPMK[];
}

interface TemplatePenilaianContentProps {
  templates: TemplatePenilaianCPMK[];
  mkId: string;
  setRefresh: Function;
  onTemplatesChange?: (templates: TemplatePenilaianCPMK[]) => void;
}

export default function TemplatePenilaianContent({
  templates,
  mkId,
  setRefresh,
}: TemplatePenilaianContentProps) {
  const [openTemplates, setOpenTemplates] = useState<number[]>([]);
  const [editingTemplate, setEditingTemplate] =
    useState<TemplatePenilaianCPMK | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const router = useRouter();

  // Toggle template expansion
  const toggleTemplate = (id: number) => {
    setOpenTemplates((current) =>
      current.includes(id)
        ? current.filter((templateId) => templateId !== id)
        : [...current, id]
    );
  };

  // Calculate total bobot for a template
  const calculateTotalBobot = (penilaianList: PenilaianCPMK[]) => {
    let total = 0;
    penilaianList.forEach((penilaian) => {
      penilaian.kriteria.forEach((k) => {
        total += k.bobot;
      });
    });
    return total;
  };

  // Handle adding a new template
  const handleAddTemplate = async () => {
    if (!newTemplateName.trim()) return;

    try {
      const payload = {
        template: newTemplateName,
        mkId: mkId,
      };

      const response = await axiosConfig.post(
        `api/templatePenilaianCPMK`,
        payload
      );

      if (response.data.status !== 400) {
        setRefresh((prev: boolean) => !prev);
        toast({
          title: "Berhasil Tambah Template",
          description: String(new Date()),
        });
      } else {
        toast({
          title: "Gagal Tambah Template",
          description: String(new Date()),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal Tambah Template",
        description: String(new Date()),
        variant: "destructive",
      });
      console.log(error);
    }

    setNewTemplateName("");
  };

  // Handle editing a template
  const handleEditTemplate = async () => {
    if (!editingTemplate || !newTemplateName.trim()) return;
    try {
      const payload = {
        template: newTemplateName,
      };

      const response = await axiosConfig.patch(
        `api/templatePenilaianCPMK/${editingTemplate.id}`,
        payload
      );

      if (response.data.status !== 400) {
        setRefresh((prev: boolean) => !prev);
        toast({
          title: "Berhasil Edit Template",
          description: String(new Date()),
        });
      } else {
        toast({
          title: "Gagal Edit Template",
          description: String(new Date()),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal Edit Template",
        description: String(new Date()),
        variant: "destructive",
      });
      console.log(error);
    }

    setEditingTemplate(null);
    setNewTemplateName("");
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (id: number) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin hapus template ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
      axiosConfig
        .delete(`api/templatePenilaianCPMK/${id}`)
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

  // Handle activating a template
  const handleActivateTemplate = async (id: number) => {
    const result = await Swal.fire({
      title: "Tunggu !..",
      text: `Kamu yakin ingin mengaktifkan template ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#0F172A",
    });

    if (result.isConfirmed) {
      axiosConfig
        .patch(`api/templatePenilaianCPMK/${id}/active`)
        .then(function (response) {
          if (response.status === 200) {
            setRefresh((prev: boolean) => !prev);
            toast({
              title: "Berhasil mengaktifkan template",
              description: String(new Date()),
            });
          } else {
            toast({
              title: "Gagal mengaktifkan template",
              description: String(new Date()),
              variant: "destructive",
            });
          }
        })
        .catch(function (error) {
          toast({
            title: "Gagal mengaktifkan template",
            description: String(new Date()),
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Template Penilaian CPMK</h2>

        <div className='flex items-center gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Tambah Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Template Penilaian</DialogTitle>
              </DialogHeader>
              <div className='py-4'>
                <Label htmlFor='template-name'>Nama Template</Label>
                <Input
                  id='template-name'
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder='Masukkan nama template'
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddTemplate}>Simpan</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => {
              router.push(`/dashboard/input/penilaianCPMK`);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Input PCPMK
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          Belum ada template penilaian. Silakan tambahkan template baru.
        </div>
      ) : (
        <div className='space-y-4'>
          {templates.map((template) => {
            const isOpen = openTemplates.includes(template.id);
            const totalBobot = calculateTotalBobot(template.penilaianCPMK);
            const isBobotComplete = totalBobot === 100;

            return (
              <Card
                key={template.id}
                className={template.active ? "border-green-500" : ""}
              >
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <CardTitle>{template.template}</CardTitle>
                      {template.active && (
                        <Badge className='bg-green-500'>Aktif</Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              setEditingTemplate(template);
                              setNewTemplateName(template.template);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Template Penilaian</DialogTitle>
                          </DialogHeader>
                          <div className='py-4'>
                            <Label htmlFor='edit-template-name'>
                              Nama Template
                            </Label>
                            <Input
                              id='edit-template-name'
                              value={newTemplateName}
                              onChange={(e) =>
                                setNewTemplateName(e.target.value)
                              }
                              placeholder='Masukkan nama template'
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant='outline'>Batal</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={handleEditTemplate}>
                                Simpan
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>

                      <Button
                        variant={template.active ? "outline" : "default"}
                        onClick={() => handleActivateTemplate(template.id)}
                        disabled={template.active}
                      >
                        {template.active ? "Aktif" : "Aktifkan"}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Total Bobot:
                    <span
                      className={`font-medium ml-1 ${
                        isBobotComplete ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {totalBobot}%
                    </span>
                    {template.penilaianCPMK.length > 0 && (
                      <span className='ml-2'>
                        ({template.penilaianCPMK.length} penilaian CPMK)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className='border rounded-md'>
                    <Button
                      variant='ghost'
                      className='w-full flex justify-between items-center rounded-md'
                      onClick={() => toggleTemplate(template.id)}
                    >
                      <span>Detail Penilaian CPMK</span>
                      {isOpen ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>

                    {isOpen && (
                      <div className='p-4 pt-2'>
                        {!isBobotComplete && (
                          <Alert variant='destructive' className='mb-4'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>
                              Total bobot belum mencapai 100%. Saat ini:{" "}
                              {totalBobot}%
                            </AlertDescription>
                          </Alert>
                        )}

                        {template.penilaianCPMK.length === 0 ? (
                          <div className='text-center py-4 text-muted-foreground'>
                            Belum ada penilaian CPMK dalam template ini.
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Kriteria</TableHead>
                                <TableHead className='text-right'>
                                  Bobot
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {template.penilaianCPMK.map((penilaian) => {
                                const penilaianBobot =
                                  penilaian.kriteria.reduce(
                                    (sum, k) => sum + k.bobot,
                                    0
                                  );

                                return (
                                  <TableRow key={penilaian.id}>
                                    <TableCell className='font-medium'>
                                      {penilaian.kode}
                                    </TableCell>
                                    <TableCell>
                                      <div className='space-y-1'>
                                        {penilaian.kriteria.map((k, idx) => (
                                          <div
                                            key={idx}
                                            className='flex justify-between'
                                          >
                                            <span>{k.kriteria}</span>
                                            <span className='text-muted-foreground'>
                                              {k.bobot}%
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                      {penilaianBobot}%
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                {isBobotComplete && (
                  <CardFooter className='pt-0'>
                    <div className='flex items-center text-sm text-green-500'>
                      <CheckCircle className='h-4 w-4 mr-1' />
                      Bobot telah mencapai 100%
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
