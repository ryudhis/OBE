"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import axiosConfig from "../../../../../utils/axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/app/contexts/AccountContext";
import { useKunci } from "@/app/contexts/KunciContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NilaiInput {
  nim: string;
  nama: string;
  nilai: Record<string, number>; // Explicitly define 'nilai' as an object with string keys and number values
  [key: string]: any; // Allow additional dynamic keys if necessary
}

interface PenilaianCPMK {
  id: string;
  nama: string;
  bobot: number;
  kriteria: { kriteria: string; bobot: number }[];
  CPMK: { kode: string }; // Added CPMK property
}

const NilaiExcel = () => {
  const router = useRouter();
  const [nilai, setNilai] = useState<NilaiInput[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [mkList, setMkList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [penilaianCPMKList, setPenilaianCPMKList] = useState<PenilaianCPMK[]>(
    []
  );
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState("");
  const [selectedMk, setSelectedMk] = useState<{
    kode: string;
    kelas: any[];
  } | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<{
    id: string;
    nama: string;
    templatePenilaianCPMK: { penilaianCPMK: PenilaianCPMK[] };
  } | null>(null);
  const { accountData } = useAccount();
  const { kunciSistem } = useKunci();
  const { toast } = useToast();

  const handleTahunChange = (value: string) => {
    setSelectedTahunAjaran(value);
  };

  useEffect(() => {
    if (accountData?.prodiId) {
      getTahunAjaran();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData?.prodiId]);

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran?limit=99999`);
      setTahunAjaranList(response.data.data);
      if (accountData) {
        getMK(accountData, response.data.data[0].id);
      }
    } catch (error) {
      toast({
        title: "Gagal mengambil data tahun ajaran",
        variant: "destructive",
      });
    }
  };

  const getMK = async (accountData: Account, tahunAjaranId: string) => {
    try {
      const userMKIds: string[] = accountData.kelas
        .filter((kelas) => kelas.tahunAjaran.id === parseInt(tahunAjaranId))
        .map((kelas) => kelas.MKId);
      const response = await axiosConfig.get(
        `api/mk?prodi=${accountData.prodiId}&limit=99999`
      );
      if (response.data.status !== 400) {
        const filteredMK = response.data.data.filter((mk: MK) =>
          userMKIds.includes(mk.kode)
        );
        setMkList(filteredMK);
        setKelasList(
          accountData.kelas.filter(
            (kelas) => kelas.tahunAjaran.id === parseInt(tahunAjaranId)
          )
        );
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hasMissingNilai = nilai.some((n) => {
    const keys = Object.keys(n.nilai || {});
    return (
      keys.length === 0 ||
      keys.length <
        penilaianCPMKList.reduce((acc, item) => acc + item.kriteria.length, 0)
    );
  });

  const exportTemplate = () => {
    if (!selectedMk || !selectedKelas || !selectedTahunAjaran) {
      toast({
        title: "Pilih tahun ajaran, mata kuliah, dan kelas terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Create headers
    const headers = [
      { header: "NIM", key: "NIM" },
      { header: "Nama", key: "NAMA" },
    ];

    penilaianCPMKList.forEach((item) => {
      item.kriteria.forEach((k) => {
        headers.push({
          header: `${item.CPMK.kode} (${item.id})\n${k.kriteria}`,
          key: `${item.CPMK.kode}|${k.kriteria}|${item.id}`,
        });
      });
    });

    // Create worksheet with headers
    const ws = XLSX.utils.json_to_sheet([], {
      header: headers.map((h) => h.key),
    });

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Export workbook
    XLSX.writeFile(
      wb,
      `Template Nilai ${selectedMk.kode} Kelas ${selectedKelas.id}.xlsx`
    );
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
      const rawParsed: any[] = XLSX.utils.sheet_to_json(sheet);

      if (
        rawParsed.length === 0 ||
        !rawParsed[0]["NIM"] ||
        !rawParsed[0]["NAMA"]
      ) {
        toast({
          title: "Format file tidak valid",
          description: "Pastikan file memiliki kolom NIM dan Nama",
          variant: "destructive",
        });
        return;
      }

      const formattedData: NilaiInput[] = rawParsed.map((row) => {
        const nilai: Record<string, number> = {};
        penilaianCPMKList.forEach((item) => {
          item.kriteria.forEach((k) => {
            const key = `${item.CPMK.kode}|${k.kriteria}|${item.id}`;
            const value = row[key];
            if (typeof value === "number") {
              nilai[key] = value;
            }
          });
        });

        return {
          nim: row["NIM"],
          nama: row["NAMA"],
          nilai,
        };
      });
      setNilai(formattedData);
    };
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    if (!selectedMk || !selectedKelas || !selectedTahunAjaran) {
      toast({
        title: "Pilih tahun ajaran, mata kuliah, dan kelas terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (nilai.length === 0) {
      toast({
        title: "Tidak ada data yang akan diupload",
        variant: "destructive",
      });
      return;
    }

    const transformed = nilai.map((mahasiswa) => {
      const nilaiArray = Object.entries(mahasiswa.nilai).map(([key, value]) => {
        const id = key.split("|").pop();
        return {
          id,
          key,
          value,
        };
      });

      return {
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        nilai: nilaiArray,
        kelasId: parseInt(selectedKelas.id),
        prodiId: accountData?.prodiId,
      };
    });

    console.log(transformed);

    axiosConfig
      .post("api/inputNilai/excel", transformed)
      .then(function (response) {
        if (response.data.status === 200) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
          setNilai([]);
        } else {
          toast({
            title: "Gagal Submit",
            description: response.data.message || "Terjadi kesalahan",
            variant: "destructive",
          });
        }
      })
      .catch(function (error) {
        toast({
          title: "Gagal Submit",
          description: error.response?.data?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
        console.log(error);
      });
  };

  if (accountData?.role === "Dosen") {
    toast({
      title: "Anda tidak memiliki akses untuk page input excel nilai",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  return (
    <section className='flex justify-center items-center mt-20'>
      {kunciSistem?.nilai ? (
        <Card className='w-[1000px]'>
          <CardHeader>
            <CardTitle>Input Nilai</CardTitle>
            <CardDescription>Nilai PCPMK</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='rounded-full bg-amber-100 p-4 mb-6'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='48'
                height='48'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-amber-600'
              >
                <path d='M12 9v4'></path>
                <path d='M12 16h.01'></path>
                <circle cx='12' cy='12' r='10'></circle>
              </svg>
            </div>
            <h2 className='text-2xl font-semibold text-center mb-2'>
              Belum Waktunya Input Nilai
            </h2>
            <p className='text-gray-500 text-center max-w-md'>
              Sistem input nilai belum dibuka. Silahkan coba lagi nanti atau
              hubungi administrator untuk informasi lebih lanjut.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className='w-[1000px]'>
          <CardHeader>
            <CardTitle>Input Nilai Excel</CardTitle>
            <CardDescription>Data Nilai Mahasiswa</CardDescription>
            <div className='flex items-center justify-end gap-4'>
              <Button
                disabled={!selectedTahunAjaran || !selectedMk || !selectedKelas}
                className='w-[130px] self-end'
                onClick={exportTemplate}
              >
                Export Template
              </Button>
              <Button
                className='w-[100px] self-end'
                onClick={() => {
                  router.push(`/dashboard/input/nilai/`);
                }}
              >
                Input Manual
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 gap-4 mb-4'>
              <Select
                onValueChange={(value) => {
                  handleTahunChange(value);
                  if (accountData) {
                    getMK(accountData, value);
                  }
                }}
                value={selectedTahunAjaran}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Pilih Tahun Ajaran' />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((tahun) => (
                    <SelectItem key={tahun.id} value={tahun.id}>
                      {tahun.tahun} {tahun.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setSelectedMk(mkList.find((mk) => mk.kode === value))
                }
                value={selectedMk?.kode ?? ""}
                disabled={!selectedTahunAjaran}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Pilih Mata Kuliah' />
                </SelectTrigger>
                <SelectContent>
                  {mkList.map((mk) => (
                    <SelectItem key={mk.kode} value={mk.kode}>
                      {mk.kode} - {mk.deskripsi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => {
                  const kelas = selectedMk?.kelas.find(
                    (kelas) => kelas.id === parseInt(value)
                  );
                  setSelectedKelas(kelas);
                  setPenilaianCPMKList(
                    kelas?.templatePenilaianCPMK.penilaianCPMK || []
                  );
                }}
                value={selectedKelas?.id?.toString() ?? ""}
                disabled={!selectedMk}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Pilih Kelas' />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id.toString()}>
                      {kelas.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              type='file'
              accept='.xlsx, .xls'
              onChange={handleFileUpload}
              disabled={!selectedKelas}
            />

            {nilai.length > 0 && (
              <Table className='mt-4 text-center'>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2}>NIM</TableHead>
                    <TableHead rowSpan={2}>Nama</TableHead>
                    {penilaianCPMKList.map((CPMK) => (
                      <TableHead
                        colSpan={CPMK.kriteria.length}
                        key={CPMK.CPMK.kode}
                        className='text-center border-x-2'
                      >
                        {CPMK.CPMK.kode}
                      </TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    {penilaianCPMKList.map((CPMK) => (
                      <React.Fragment key={CPMK.CPMK.kode}>
                        {CPMK.kriteria.map((kriteria, index) => (
                          <TableHead
                            className='text-center border-x-2'
                            key={`${CPMK.CPMK.kode}-${index}`}
                          >
                            {kriteria.kriteria}
                            <br />
                            <span className='font-semibold text-blue-600'>
                              {kriteria.bobot}
                            </span>
                          </TableHead>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {nilai.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.nim}</TableCell>
                      <TableCell>{row.nama}</TableCell>
                      {penilaianCPMKList.map((cpmk) =>
                        cpmk.kriteria.map((k) => {
                          const key = `${cpmk.CPMK.kode}|${k.kriteria}|${cpmk.id}`;
                          return (
                            <TableCell key={key}>
                              {row.nilai?.[key] !== undefined
                                ? row.nilai[key]
                                : "-"}
                            </TableCell>
                          );
                        })
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <div className='flex flex-col'>
              {hasMissingNilai && (
                <p className='text-red-500 font-semibold'>
                  NILAI BELUM LENGKAP!
                </p>
              )}
              <Button
                onClick={onSubmit}
                disabled={nilai.length === 0 || hasMissingNilai}
              >
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </section>
  );
};

export default NilaiExcel;
