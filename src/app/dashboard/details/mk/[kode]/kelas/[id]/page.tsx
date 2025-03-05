"use client";
import axiosConfig from "@utils/axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SkeletonTable from "@/components/SkeletonTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/app/contexts/AccountContext";
import { useRouter } from "next/navigation";
import { BarChartComponent } from "@/components/BarChart";
import { Check, X } from "lucide-react";

interface mahasiswaExcel {
  NIM: string;
  Nama: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [kelas, setKelas] = useState<Kelas | undefined>();
  const [dataMahasiswaLulus, setDataMahasiswaLulus] = useState<
    mahasiswaLulus[]
  >([]);
  const [mahasiswa, setMahasiswa] = useState<mahasiswaExcel[]>([]);
  const [allDosen, setAllDosen] = useState<Account[]>([]);
  const [selectedDosen, setSelectedDosen] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { accountData, fetchData } = useAccount();
  const [selectedCPMK, setSelectedCPMK] = useState<number>(0);
  const [selectedCPL, setSelectedCPL] = useState<number>(0);
  const [evaluasi, setEvaluasi] = useState<string>("");

  const handleSelectCPMK = (cpmkId: number) => {
    setSelectedCPMK(cpmkId);
    setEvaluasi("");
  };

  const handleSelectCPL = (cplId: number) => {
    setSelectedCPL(cplId);
    setEvaluasi("");
  };

  const handleEvaluasiCPMK = async () => {
    const data = {
      CPMKId: selectedCPMK,
      evaluasi: evaluasi,
    };

    axiosConfig
      .post(`api/kelas/${id}/evaluasiCPMK`, data)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Gagal Submit!",
            description: response.data.message,
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
      })
      .finally(() => {
        setRefresh(!refresh);
        setSelectedCPMK(0);
        setEvaluasi("");
      });
  };

  const handleEvaluasiCPL = async () => {
    const data = {
      CPLId: selectedCPL,
      evaluasi: evaluasi,
    };

    axiosConfig
      .post(`api/kelas/${id}/evaluasiCPL`, data)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Gagal Submit!",
            description: response.data.message,
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
      })
      .finally(() => {
        setRefresh(!refresh);
        setSelectedCPL(0);
        setEvaluasi("");
      });
  };

  const handleTindakLanjutCPMK = async () => {
    const data = {
      tindakLanjutCPMK: evaluasi,
    };

    axiosConfig
      .patch(`api/kelas/${id}`, data)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Gagal Submit!",
            description: response.data.message,
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
      })
      .finally(() => {
        setRefresh(!refresh);
        setEvaluasi("");
      });
  };

  const handleTindakLanjutCPL = async () => {
    const data = {
      tindakLanjutCPL: evaluasi,
    };

    axiosConfig
      .patch(`api/kelas/${id}`, data)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Gagal Submit!",
            description: response.data.message,
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
      })
      .finally(() => {
        setRefresh(!refresh);
        setEvaluasi("");
      });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsBinaryString(e.target.files[0]);
    }
    reader.onload = (e) => {
      const dataWorkbook = e.target?.result;
      const workbook = XLSX.read(dataWorkbook, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let parsedData: mahasiswaExcel[] = XLSX.utils.sheet_to_json(sheet);

      // Filter parsedData to only include Nama and NIM data
      parsedData = parsedData.map((item: any) => ({
        Nama: item.Nama,
        NIM: item.NIM,
      }));
      setMahasiswa(parsedData);
    };
  };

  function onSubmit(e: any) {
    e.preventDefault();

    const data = {
      mahasiswa: mahasiswa,
      kelasId: id,
    };

    axiosConfig
      .patch(`api/kelas/tambahMahasiswa/${id}`, data)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Gagal Submit!",
            description: response.data.message,
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
      })
      .finally(() => {
        setRefresh(!refresh);
      });
  }

  const getKelas = async () => {
    setIsLoading(true);
    try {
      const response = await axiosConfig.get(`api/kelas/${id}`);

      if (response.data.status === 200) {
        if (response.data.data.MK.prodiId !== accountData?.prodiId) {
          router.push("/dashboard");
          toast({
            title: `Anda tidak memiliki akses untuk page detail Kelas prodi ${response.data.data.MK.prodiId}`,
            variant: "destructive",
          });
        } else {
          const kelasData = response.data.data;
          const mahasiswaLulusData: mahasiswaLulus[] = [];

          kelasData.mahasiswa.forEach((mahasiswa: Mahasiswa) => {
            mahasiswa.kelas.forEach((kelasMahasiswa: Kelas) => {
              if (kelasMahasiswa.id === kelasData.id) {
                kelasMahasiswa.mahasiswaLulus?.forEach(
                  (mahasiswaLulus: mahasiswaLulus) => {
                    if (mahasiswaLulus.nim === mahasiswa.nim) {
                      mahasiswaLulusData.push(mahasiswaLulus);
                    }
                  }
                );
              }
            });
          });

          setDataMahasiswaLulus(mahasiswaLulusData);
          setKelas(kelasData);

          const dosenIds = kelasData.dosen.map((dosen: Account) => dosen.id);
          setSelectedDosen(new Set(dosenIds));
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDosen = async () => {
    try {
      const response = await axiosConfig.get(
        `api/account/getDosen?prodi=${accountData?.prodiId}`
      );
      setAllDosen(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDosenChange = (dosenId: number) => {
    setSelectedDosen((prevSelectedDosen) => {
      const newSelectedDosen = new Set(prevSelectedDosen);
      if (newSelectedDosen.has(dosenId)) {
        newSelectedDosen.delete(dosenId);
      } else {
        newSelectedDosen.add(dosenId);
      }
      return newSelectedDosen;
    });
  };

  const updateDosen = async () => {
    const payload = Array.from(selectedDosen);

    try {
      const response = await axiosConfig.patch(`api/kelas/${id}/updateDosen`, {
        dosen: payload,
      });
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: "Dosen berhasil ditambahkan!",
          variant: "default",
        });
        fetchData();
        setRefresh(!refresh);
      } else {
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update dosen",
        variant: "destructive",
      });
    }
  };

  const transformCPMKData = (
    data: { cpmk: string; persenLulus: number }[]
  ): { subject: string; percentage: number }[] => {
    return data.map((item) => ({
      subject: item.cpmk,
      percentage: item.persenLulus,
    }));
  };

  const transformCPLData = (
    data: { cpl: string; persenLulus: number }[]
  ): { subject: string; percentage: number }[] => {
    return data.map((item) => ({
      subject: item.cpl,
      percentage: item.persenLulus,
    }));
  };

  const renderDosenChecklist = () => {
    return allDosen.map((dosen) => (
      <label key={dosen.id} className='flex items-center space-x-2'>
        <input
          type='checkbox'
          checked={selectedDosen.has(dosen.id)}
          onChange={() => handleDosenChange(dosen.id)}
        />
        <span>{dosen.nama}</span>
      </label>
    ));
  };

  useEffect(() => {
    getAllDosen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getKelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const renderNoNimNama = () => {
    return dataMahasiswaLulus.map((lulusData, index) => (
      <TableRow key={lulusData.nim}>
        <TableCell className='w-[8%] text-center'>{index + 1}</TableCell>
        <TableCell className='w-[8%] text-center'>{lulusData.nim}</TableCell>
        <TableCell className='w-[8%] border-r-2'>
            {(() => {
            const nama = kelas?.mahasiswa.find((m) => m.nim === lulusData.nim)?.nama || "-";
            return nama.length > 34 ? `${nama.substring(0, 45)}...` : nama;
            })()}
        </TableCell>
      </TableRow>
    ));
  };

  const renderRestData = () => {
    return dataMahasiswaLulus.map((lulusData) => (
      <TableRow key={lulusData.nim}>
        <TableCell className={`w-[8%]`}>{lulusData.totalNilai}</TableCell>
        <TableCell
          className={`w-[8%] text-center ${
            lulusData.indexNilai <= "C" ? "bg-green-300" : "bg-red-300"
          }`}
        >
          {lulusData.indexNilai}
        </TableCell>
        {kelas?.MK.penilaianCPMK.map((CPMK) => {
          const nilaiMahasiswaItem = lulusData.nilaiMahasiswa.find(
            (item) => item.namaCPMK === CPMK.CPMK.kode
          );
          const statusCPMKItem = lulusData.statusCPMK.find(
            (item) => item.namaCPMK === CPMK.CPMK.kode
          );

          return (
            <React.Fragment key={CPMK.CPMK.kode}>
              {nilaiMahasiswaItem
                ? nilaiMahasiswaItem.nilai.map((nilai, index) => {
                    const isNilaiValid = nilai >= nilaiMahasiswaItem.batasNilai;
                    const cellClassName = isNilaiValid
                      ? "bg-green-300"
                      : "bg-red-300";
                    return (
                      <TableCell
                        key={index}
                        className={`w-[16%] border-x-2 text-center ${cellClassName}`}
                      >
                        {nilai}
                      </TableCell>
                    );
                  })
                : Array.from({ length: CPMK.kriteria.length }, (_, i) => (
                    <TableCell key={i} className='w-[16%] text-center'>
                      -
                    </TableCell>
                  ))}
              <TableCell
                key={`status-${CPMK.CPMK.kode}`}
                className={`w-[16%] ${
                  statusCPMKItem?.statusLulus === "Lulus"
                    ? "bg-green-300"
                    : "bg-red-300"
                }`}
              >
                {statusCPMKItem?.statusLulus === "Lulus" ? (
                  <Check className='mx-auto' size={20} />
                ) : (
                  <X className='mx-auto' size={20} />
                )}
              </TableCell>
            </React.Fragment>
          );
        })}
      </TableRow>
    ));
  };

  const renderEvaluasiCPMK = () => {
    return kelas?.dataCPMK?.map((data) => {
      // Find the corresponding evaluasiCPMK object where CPMKId matches
      const evaluasiCPMKItem = kelas?.evaluasiCPMK?.find(
        (evaluasi) => evaluasi.CPMKId === data.cpmkId
      );

      return (
        <TableRow key={data.cpmk}>
          <TableCell className='w-[15%]'>{data.cpmk}</TableCell>
          <TableCell className='flex-1'>
            {evaluasiCPMKItem ? evaluasiCPMKItem.evaluasi : "-"}
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderEvaluasiCPL = () => {
    return kelas?.dataCPL?.map((data) => {
      // Find the corresponding evaluasiCPL object where CPLId matches
      const evaluasiCPLItem = kelas?.evaluasiCPL?.find(
        (evaluasi) => evaluasi.CPLId === data.cplId
      );

      return (
        <TableRow key={data.cpl}>
          <TableCell className='w-[15%]'>{data.cpl}</TableCell>
          <TableCell className='flex-1'>
            {evaluasiCPLItem ? evaluasiCPLItem.evaluasi : "-"}
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderDataRangkumanCPMK = () => {
    return kelas?.dataCPMK?.map((data) => {
      return (
        <TableRow key={data.cpmk}>
          <TableCell className='w-[8%] text-center'>{data.cpl}</TableCell>
          <TableCell className='w-[8%] text-center'>{data.cpmk}</TableCell>
          <TableCell className='w-[8%] text-center'>
            {data.nilaiMinimal}/100
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {data.nilaiMasuk}/{kelas.mahasiswa.length}
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {data.jumlahLulus}/{kelas.mahasiswa.length}
          </TableCell>
          <TableCell className='w-[8%] text-center'>
            {data.persenLulus}%
          </TableCell>
          <TableCell className='w-[8%] text-center'>{data.rataNilai}</TableCell>
          <TableCell className='w-[8%] text-center'>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleSelectCPMK(data.cpmkId)}
                  variant='outline'
                >
                  Evaluasi
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Evaluasi</DialogTitle>
                  <DialogDescription>{data.cpmk}</DialogDescription>
                </DialogHeader>
                <Textarea
                  value={evaluasi}
                  onChange={(e) => setEvaluasi(e.target.value)}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      className='bg-blue-500 hover:bg-blue-600'
                      onClick={handleEvaluasiCPMK}
                    >
                      Submit
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderDataRangkumanCPL = () => {
    return kelas?.dataCPL?.map((data) => {
      return (
        <TableRow key={data.cpl}>
          <TableCell className='w-[8%] text-center'>{data.cpl}</TableCell>
          <TableCell className='w-[8%] text-center'>
            {data.persenLulus}%
          </TableCell>
          <TableCell className='w-[8%] text-center'>{data.rataNilai}</TableCell>
          <TableCell className='w-[8%] text-center'>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleSelectCPL(data.cplId)}
                  variant='outline'
                >
                  Evaluasi
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Evaluasi</DialogTitle>
                  <DialogDescription>{data.cpl}</DialogDescription>
                </DialogHeader>
                <Textarea
                  value={evaluasi}
                  onChange={(e) => setEvaluasi(e.target.value)}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      className='bg-blue-500 hover:bg-blue-600'
                      onClick={handleEvaluasiCPL}
                    >
                      Submit
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TableCell>
        </TableRow>
      );
    });
  };

  if (kelas) {
    return (
      <main className='mx-auto pt-20 mb-10 flex flex-col gap-12 '>
        <Card className='w-[1200px] mx-auto'>
          <CardHeader className='flex justify-center'>
            <CardTitle>Data Kelas {kelas.nama} </CardTitle>
            <CardDescription>
              Kelas {kelas.MK.deskripsi} - {kelas.tahunAjaran.tahun}{" "}
              {kelas.tahunAjaran.semester}{" "}
            </CardDescription>
            <Table className='w-[1000px] table-fixed mb-5'>
              <TableBody>
                <TableRow>
                  <TableCell className='w-[20%] p-2'>
                    <strong>Dosen Pengampu</strong>
                  </TableCell>
                  <TableCell className='p-2'>
                    {": "}
                    {kelas.dosen.length > 0
                      ? kelas.dosen.map((dosen) => dosen.nama).join(", ")
                      : "Belum ada dosen"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardHeader>
          <CardContent className='flex gap-3'>
            <Dialog>
              <DialogTrigger asChild>
                <Button className='w-[200px] self-center' variant='outline'>
                  Tambah Mahasiswa
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Input Mahasiswa</DialogTitle>
                </DialogHeader>
                <Card className='mx-auto'>
                  <CardHeader>
                    <CardDescription>Data Mahasiswa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type='file'
                      accept='.xlsx, .xls'
                      onChange={handleFileUpload}
                    />

                    {mahasiswa.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(mahasiswa[0]).map((key, index) => (
                              <TableHead key={index}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mahasiswa.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, index) => (
                                <TableCell key={index}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={onSubmit}>Submit</Button>
                  </CardFooter>
                </Card>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className={`w-[200px] self-center ${
                    accountData?.role === "Dosen" ? "hidden" : null
                  }`}
                  variant='outline'
                >
                  Dosen Pengampu
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Dosen Pengampu</DialogTitle>
                </DialogHeader>
                <Card className='mx-auto'>
                  <CardHeader>
                    <CardDescription>Data Dosen</CardDescription>
                  </CardHeader>
                  <CardContent className='flex w-[300px]'>
                    <div className='flex flex-col gap-2'>
                      {" "}
                      {renderDosenChecklist()}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={updateDosen}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {kelas.mahasiswa.length != 0 ? (
          <Card className='w-[1200px] mx-auto'>
            <CardHeader className='flex flex-row justify-between items-center'>
              <div className='flex flex-col'>
                <CardTitle>Tabel Mahasiswa Kelas {kelas.nama}</CardTitle>
                <CardDescription>Kelas {kelas.MK.deskripsi}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='nilai' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='nilai'>Nilai Mahasiswa</TabsTrigger>
                  <TabsTrigger value='rangkumanCPMK'>
                    Rangkuman Evaluasi CPMK
                  </TabsTrigger>
                  <TabsTrigger value='rangkumanCPL'>
                    Rangkuman Evaluasi CPL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='nilai'>
                  {isLoading ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-[8%]'>NIM</TableHead>
                          <TableHead className='w-[8%]'>Nama</TableHead>
                          <TableHead className='w-[8%]'>Total Nilai</TableHead>
                          {kelas.MK.penilaianCPMK.map((CPMK) => (
                            <TableHead
                              colSpan={CPMK.kriteria.length}
                              key={CPMK.CPMK.kode}
                              className='w-[16%]'
                            >
                              {CPMK.CPMK.kode}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <SkeletonTable rows={5} cols={5} />
                      </TableBody>
                    </Table>
                  ) : (
                    <div className='flex'>
                      <Table>
                        <TableHeader className='h-[150px]'>
                          <TableRow>
                            <TableHead
                              rowSpan={2}
                              className='w-[2%] text-center '
                            >
                              No
                            </TableHead>
                            <TableHead
                              rowSpan={2}
                              className='w-[2%] text-center '
                            >
                              NIM
                            </TableHead>
                            <TableHead
                              rowSpan={2}
                              className='w-full text-center border-r-2'
                            >
                              Nama
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{renderNoNimNama()}</TableBody>
                      </Table>
                      <Table>
                        <TableHeader className='h-[150px]'>
                          <TableRow >
                            <TableHead
                              rowSpan={2}
                              className='w-[8%] text-center '
                            >
                              Total Nilai
                            </TableHead>
                            <TableHead
                              rowSpan={2}
                              className='w-[8%] text-center'
                            >
                              Indeks Nilai
                            </TableHead>
                            {kelas.MK.penilaianCPMK.map((CPMK) => (
                              <TableHead
                                colSpan={CPMK.kriteria.length + 1}
                                key={CPMK.CPMK.kode}
                                className='w-[16%] text-center border-x-2'
                              >
                                {CPMK.CPMK.kode}
                              </TableHead>
                            ))}
                          </TableRow>
                          <TableRow>
                            {kelas.MK.penilaianCPMK.map((CPMK) => (
                              <React.Fragment key={CPMK.CPMK.kode}>
                                {CPMK.kriteria.map((kriteria, index) => (
                                  <TableHead
                                    className='text-center w-[16%] border-x-2'
                                    key={index}
                                  >
                                    {kriteria.kriteria} <br />{" "}
                                    <span className='font-semibold text-blue-600'>
                                      {kriteria.bobot}
                                    </span>
                                  </TableHead>
                                ))}
                                <TableHead
                                  className='text-center w-[16%] border-x-2'
                                  key={`status-${CPMK.CPMK.kode}`}
                                >
                                  Status
                                </TableHead>
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>{renderRestData()}</TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='rangkumanCPMK'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          CPL{" "}
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          CPMK
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Total Nilai Minimal
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Nilai Masuk
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Jumlah Lulus
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Persentase Lulus
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Rata-Rata Nilai
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderDataRangkumanCPMK()}</TableBody>
                  </Table>

                  <Table className='my-10'>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[15%]'>CPMK</TableHead>
                        <TableHead className='flex-1'>Hasil Evaluasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderEvaluasiCPMK()}</TableBody>
                  </Table>

                  <div className='flex justify-between'>
                    <BarChartComponent
                      data={transformCPMKData(kelas.dataCPMK || [])}
                      tipe={"Capaian Mata Kuliah"}
                    />

                    <Card className='w-[45%] '>
                      <CardHeader>
                        <div className='flex justify-between'>
                          <div>
                            <CardTitle>Tindak Lanjut</CardTitle>
                            <CardDescription>Evaluasi CPMK</CardDescription>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline'>Edit</Button>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-[425px]'>
                              <DialogHeader>
                                <DialogTitle>
                                  Tindak Lanjut Evaluasi
                                </DialogTitle>
                              </DialogHeader>
                              <Textarea
                                value={evaluasi}
                                onChange={(e) => setEvaluasi(e.target.value)}
                              />
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    className='bg-blue-500 hover:bg-blue-600'
                                    onClick={handleTindakLanjutCPMK}
                                  >
                                    Submit
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='break-words'>
                          {kelas?.tindakLanjutCPMK != null
                            ? kelas?.tindakLanjutCPMK
                            : " Belum Ada Tindak Lanjut "}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value='rangkumanCPL'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          CPL
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Persentase Lulus
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Rata-Rata Nilai
                        </TableHead>
                        <TableHead className='w-[8%] text-center border-x-2'>
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderDataRangkumanCPL()}</TableBody>
                  </Table>

                  <Table className='my-10'>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[15%]'>CPL</TableHead>
                        <TableHead className='flex-1'>Hasil Evaluasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderEvaluasiCPL()}</TableBody>
                  </Table>

                  <div className='flex justify-between'>
                    <BarChartComponent
                      data={transformCPLData(kelas.dataCPL || [])}
                      tipe='Capaian Pembelajaran Lulusan'
                    />

                    <Card className='w-[45%] '>
                      <CardHeader>
                        <div className='flex justify-between'>
                          <div>
                            <CardTitle>Tindak Lanjut</CardTitle>
                            <CardDescription>Evaluasi CPL</CardDescription>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline'>Edit</Button>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-[425px]'>
                              <DialogHeader>
                                <DialogTitle>
                                  Tindak Lanjut Evaluasi
                                </DialogTitle>
                              </DialogHeader>
                              <Textarea
                                value={evaluasi}
                                onChange={(e) => setEvaluasi(e.target.value)}
                              />
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    className='bg-blue-500 hover:bg-blue-600'
                                    onClick={handleTindakLanjutCPL}
                                  >
                                    Submit
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className=''>
                        <p className='break-words'>
                          {kelas?.tindakLanjutCPL != null
                            ? kelas?.tindakLanjutCPL
                            : " Belum Ada Tindak Lanjut "}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <h1 className='self-center'>Belum ada data mahasiswa.</h1>
        )}
      </main>
    );
  }
}
