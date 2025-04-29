"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, ChevronDown, ChevronRight, ChevronUp, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosConfig from "@/utils/axios"
import { toast } from "@/components/ui/use-toast"

type MahasiswaVisualizationProps = {
  mahasiswaPerbaikan: mahasiswaLulus[]
  setRefresh: Function
}

export default function RepairNilai({ mahasiswaPerbaikan, setRefresh }: MahasiswaVisualizationProps) {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string | null>(null)
  const [expandedCPMK, setExpandedCPMK] = useState<{
    nim: string
    cpmkId: number
  } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCPMK, setSelectedCPMK] = useState<{
    nim: string
    cpmkId: number
    cpmkName: string
    kriteria: string[]
    nilai: number[]
  } | null>(null)

  const handlePerbaiki = (e: React.MouseEvent, mahasiswaNim: string, cpmkId: number, cpmkName: string) => {
    e.stopPropagation()
    const mahasiswa = mahasiswaPerbaikan.find((m) => m.nim === mahasiswaNim)
    if (!mahasiswa) return

    const cpmkData = mahasiswa.statusCPMK.find((c) => c.nilaiId === cpmkId)
    if (!cpmkData) return

    const nilaiData = findNilaiMahasiswa(mahasiswa, cpmkName)
    if (!nilaiData) return

    setSelectedCPMK({
      nim: mahasiswaNim,
      cpmkId,
      cpmkName,
      kriteria: cpmkData.kriteria,
      nilai: [...nilaiData.nilai],
    })

    setDialogOpen(true)
  }

  const findNilaiMahasiswa = (mahasiswa: mahasiswaLulus, cpmkName: string) => {
    return mahasiswa.nilaiMahasiswa.find((nilai) => nilai.namaCPMK === cpmkName)
  }

  const toggleCPMKDetails = (nim: string, cpmkId: number) => {
    if (expandedCPMK?.nim === nim && expandedCPMK?.cpmkId === cpmkId) {
      setExpandedCPMK(null)
    } else {
      setExpandedCPMK({ nim, cpmkId })
    }
  }

  const handleNilaiChange = (index: number, value: string) => {
    if (!selectedCPMK) return

    const newNilai = [...selectedCPMK.nilai]
    newNilai[index] = Number.parseFloat(value) || 0

    setSelectedCPMK({
      ...selectedCPMK,
      nilai: newNilai,
    })
  }

  const handleSubmitPerbaikan = () => {
    if (!selectedCPMK) return

    const data = {
      nilai: selectedCPMK.nilai,
    }

    axiosConfig
      .patch(`api/inputNilai/${selectedCPMK.cpmkId}`, data)
      .then((response) => {
        if (response.data.status != 400) {
          setRefresh((prev: boolean) => !prev)
          toast({
            title: "Berhasil Perbaiki Nilai",
            description: String(new Date()),
          })
        } else {
          toast({
            title: response.data.message,
            description: String(new Date()),
            variant: "destructive",
          })
        }
      })
      .catch((error) => {
        toast({
          title: "Gagal Perbaiki Nilai",
          description: String(new Date()),
          variant: "destructive",
        })
        console.log(error)
      })

    setDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {mahasiswaPerbaikan.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-center mb-2">Tidak ada mahasiswa yang butuh perbaikan</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Semua mahasiswa telah mencapai nilai minimum yang diperlukan untuk lulus MK.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {mahasiswaPerbaikan.map((mahasiswa) => (
            <Card key={mahasiswa.nim} className="overflow-hidden border-red-200 dark:border-red-800">
              <CardHeader
                className="cursor-pointer bg-red-50 dark:bg-red-950/20"
                onClick={() => setSelectedMahasiswa(selectedMahasiswa === mahasiswa.nim ? null : mahasiswa.nim)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-full">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{mahasiswa.nama}</CardTitle>
                      <p className="text-sm text-muted-foreground">NIM: {mahasiswa.nim}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="ml-2">
                      Tidak Lulus
                    </Badge>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mahasiswa.indexNilai}</div>
                      <div className="text-xs text-muted-foreground">Index</div>
                    </div>
                    <ChevronRight
                      className={`transition-transform ${selectedMahasiswa === mahasiswa.nim ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </CardHeader>

              {selectedMahasiswa === mahasiswa.nim && (
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">CPMK Yang Perlu Diperbaiki</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama CPMK</TableHead>
                          <TableHead>Nilai</TableHead>
                          <TableHead>Batas Nilai</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mahasiswa.statusCPMK.map((cpmk) => {
                          const nilaiData = findNilaiMahasiswa(mahasiswa, cpmk.namaCPMK)
                          if (!nilaiData) return null

                          const isExpanded =
                            expandedCPMK?.nim === mahasiswa.nim && expandedCPMK?.cpmkId === cpmk.nilaiId

                          return (
                            <React.Fragment key={cpmk.nilaiId}>
                              <TableRow
                                className={`cursor-pointer hover:bg-red-50/70 dark:hover:bg-red-950/20 ${
                                  isExpanded ? "border-b-0 bg-red-50/50 dark:bg-red-950/10" : ""
                                }`}
                                onClick={() => toggleCPMKDetails(mahasiswa.nim, cpmk.nilaiId)}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {cpmk.namaCPMK}
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {cpmk.nilaiCPMK}
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  </div>
                                </TableCell>
                                <TableCell>{nilaiData.batasNilai}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    onClick={(e) => handlePerbaiki(e, mahasiswa.nim, cpmk.nilaiId, cpmk.namaCPMK)}
                                  >
                                    Perbaiki
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow className="bg-red-50/50 dark:bg-red-950/10">
                                  <TableCell colSpan={4} className="p-0">
                                    <div className="p-4">
                                      <div className="text-sm font-medium mb-2">Detail Nilai Per Kriteria:</div>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              {cpmk.kriteria.map((kriteria, kIdx) => (
                                                <TableHead key={kIdx} className="text-center">
                                                  {kriteria}
                                                </TableHead>
                                              ))}
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            <TableRow>
                                              {nilaiData.nilai.map((n, nIdx) => (
                                                <TableCell key={nIdx} className="text-center">
                                                  <div className="p-2 rounded-md inline-block min-w-16 bg-red-100 dark:bg-red-900/30">
                                                    <div className="text-lg font-bold">{n}</div>
                                                  </div>
                                                </TableCell>
                                              ))}
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      {/* Dialog for updating nilai */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perbaiki Nilai {selectedCPMK?.cpmkName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedCPMK?.kriteria.map((kriteria, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`nilai-${index}`} className="text-right col-span-1">
                  {kriteria}
                </Label>
                <div className="col-span-3">
                  <Input
                    id={`nilai-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={selectedCPMK?.nilai[index] || 0}
                    onChange={(e) => handleNilaiChange(index, e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmitPerbaikan}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
