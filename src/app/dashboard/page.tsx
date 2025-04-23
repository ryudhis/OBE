"use client";

import React, { useState, useEffect, use } from "react";
import axiosConfig from "@utils/axios";
import { useAccount } from "@/app/contexts/AccountContext";
import { useKunci } from "@/app/contexts/KunciContext";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SkeletonTable from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CustomRadar from "@/components/CustomRadar";

const Page = () => {
  const router = useRouter();
  const { accountData } = useAccount();
  const { kunciData, fetchData } = useKunci();
  const [isLoading, setIsLoading] = useState(true);
  const [performaCPMK, setPerformaCPMK] = useState<PerformaCPMKResponse[]>([]);
  const [MKDiampu, setMKDiampu] = useState<MK[]>([]);
  const [performaCPL, setPerformaCPL] = useState<PerformaCPL[]>([]);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [semester, setSemester] = useState<TahunAjaran[]>([]);
  const [dataCount, setDataCount] = useState<DataCount[]>([]);
  const [dataSistem, setDataSistem] = useState<DataCount[]>([]);
  const [calculatedCPL, setCalculatedCPL] = useState<CalculatedPerformaCPL[]>(
    []
  );

  const kunciPerubahan = async () => {
    try {
      const response = await axiosConfig.patch(`api/kunci`);
      if (response.data.status !== 400) {
        fetchData();
        return response.data.data;
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the patch operation:", error);
    }
  };

  const getMKDiampu = async () => {
    try {
      const response = await axiosConfig.get(
        `api/mk/diampu?dosen=${accountData?.id}&tahunAjaran=${filterTahunAjaran}`
      );
      if (response.data.status !== 400) {
        setMKDiampu(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformaCPMK = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(
        `api/performaCPMK?prodi=${prodiId}`
      );
      if (response.data.status !== 400) {
        setPerformaCPMK(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformaCPL = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(
        `api/performaCPL?prodi=${prodiId}`
      );
      if (response.data.status !== 400) {
        setPerformaCPL(response.data.data);
        const transformed = calculateChartData(response.data.data);
        setCalculatedCPL(transformed);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTahunAjaran = async () => {
    try {
      const response = await axiosConfig.get(`api/tahun-ajaran?limit=99999`);
      if (response.data.status !== 400) {
        setSemester(response.data.data);
        setFilterTahunAjaran(String(response.data.data[0].id));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const getDataCount = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/dataCount?prodi=${prodiId}`);
      if (response.data.status !== 400) {
        setDataCount(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDataSistem = async () => {
    try {
      const response = await axiosConfig.get(`api/dataSistem`);
      if (response.data.status !== 400) {
        setDataSistem(response.data.data);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAdminRoutes = (name: string) => {
    if (name === "PCPMK") {
      return `/dashboard/data/penilaianCPMK`;
    }
    if (name === "Tahun Ajaran") {
      return `/dashboard/data/tahunAjaran`;
    } else {
      return `/dashboard/data/${name.toLocaleLowerCase()}`;
    }
  };

  function calculateChartData(raw: PerformaCPL[]): CalculatedPerformaCPL[] {
    return raw.map((cpl) => {
      const CPMK = cpl.CPMK.map((cpmk) => {
        const totalNilai: number = cpmk.lulusMK_CPMK.reduce(
          (acc: number, mk) => acc + mk.jumlahLulus,
          0
        );
        const countMK: number = cpmk.lulusMK_CPMK.length;
        const mkValue: number = countMK ? totalNilai / countMK : 0;

        return {
          kode: cpmk.kode.trim(),
          nilai: `${mkValue.toFixed(2)}%`,
          value: mkValue,
          MK: cpmk.lulusMK_CPMK.map((mk) => ({
            kode: mk.MKId,
            nilai: `${mk.jumlahLulus}%`,
            value: mk.jumlahLulus,
          })),
        };
      });

      const totalCPMK: number = CPMK.reduce(
        (acc, cpmk) => acc + parseFloat(cpmk.nilai),
        0
      );
      const countCPMK = CPMK.length;
      const cplValue = countCPMK ? totalCPMK / countCPMK : 0;

      return {
        kode: cpl.kode.trim(),
        nilai: `${cplValue.toFixed(2)}%`,
        value: cplValue,
        CPMK,
      };
    });
  }

  useEffect(() => {
    if (accountData && accountData.role === "Kaprodi") {
      getPerformaCPMK(accountData.prodiId);
      getPerformaCPL(accountData.prodiId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accountData && accountData.role === "Super Admin") {
      getDataSistem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accountData && accountData.role === "Admin") {
      getDataCount(accountData.prodiId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      accountData &&
      filterTahunAjaran &&
      (accountData.role === "Kaprodi" || accountData.role === "Dosen")
    ) {
      getMKDiampu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTahunAjaran]);

  useEffect(() => {
    if (accountData) {
      getTahunAjaran();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderData = () => {
    if (MKDiampu.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className='text-center'>
            Belum ada data
          </TableCell>
        </TableRow>
      );
    }

    let jumlahMahasiswa = 0;

    return MKDiampu.map((mk) => {
      jumlahMahasiswa = 0;
      {
        mk.kelas
          .filter(
            (kelas) => kelas.tahunAjaranId === parseInt(filterTahunAjaran)
          )
          .map((kelas) => (jumlahMahasiswa += kelas.mahasiswa.length));
      }
      return (
        <TableRow key={mk.kode}>
          <TableCell className='text-center'>{mk.kode}</TableCell>
          <TableCell className='flex-1 text-center'>
            {mk.deskripsi.length > 20
              ? mk.deskripsi.slice(0, 18) + "..."
              : mk.deskripsi}
          </TableCell>
          <TableCell className='flex-1 text-center'>
            {mk.deskripsiInggris.length > 20
              ? mk.deskripsiInggris.slice(0, 18) + "..."
              : mk.deskripsiInggris}
          </TableCell>
          <TableCell className='text-center'>{jumlahMahasiswa}</TableCell>
          <TableCell className='flex gap-2 justify-center'>
            <Button
              onClick={() => {
                router.push(`/dashboard/details/mk/${mk.kode}/`);
              }}
            >
              Details
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderDataRangkuman = () => {
    if (!performaCPMK || performaCPMK.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={9} className='text-center font-semibold'>
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return performaCPMK.flatMap((item) => {
      return item.kelas
        ?.filter((kelas) => kelas.tahunAjaranId === Number(filterTahunAjaran))
        .map((kelas) => {
          return kelas.dataCPMK?.map((data) => (
            <TableRow key={`${kelas.id}-${data.cpmk}`}>
              <TableCell>{item.kode}</TableCell>
              <TableCell>{kelas.nama}</TableCell>
              <TableCell>{data.cpmk}</TableCell>
              <TableCell>{data.cpl}</TableCell>
              <TableCell>{data.nilaiMinimal}</TableCell>
              <TableCell>
                {data.nilaiMasuk}/{kelas.mahasiswaCount}
              </TableCell>
              <TableCell>
                {data.jumlahLulus}/{kelas.mahasiswaCount}
              </TableCell>
              <TableCell>{data.persenLulus}%</TableCell>
              <TableCell>{data.rataNilai}</TableCell>
            </TableRow>
          ));
        });
    });
  };

  const renderRangkumanPerforma = () => {
    if (!performaCPL || performaCPL.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className='text-center font-semibold'>
            Belum ada Data
          </TableCell>
        </TableRow>
      );
    }

    return performaCPL.flatMap((cplItem) => {
      const cplPerforma =
        cplItem.CPMK.reduce((total, CPMK) => {
          const lulusCPMKValue =
            CPMK.lulusCPMK
              .filter(
                (item) => item.tahunAjaranId === Number(filterTahunAjaran)
              )
              .map((item) => item.jumlahLulus)[0] ?? 0;
          return total + Number(lulusCPMKValue);
        }, 0) / cplItem.CPMK.length;

      const CPMKRows = cplItem.CPMK.map((CPMK) => {
        const MKContent = CPMK.lulusMK_CPMK
          .filter((item) => item.tahunAjaranId === Number(filterTahunAjaran))
          .map((lulusMK_CPMK, index, array) => {
            const lulusMK_CPMKValue = lulusMK_CPMK.jumlahLulus.toFixed(2);
            const textColorClass =
              Number(lulusMK_CPMKValue) < 65 || !lulusMK_CPMKValue
                ? "text-red-500"
                : "";

            return (
              <React.Fragment key={lulusMK_CPMK.id}>
                <span className={textColorClass}>
                  {`${lulusMK_CPMK.MKId} (${
                    lulusMK_CPMKValue ? lulusMK_CPMKValue : 0
                  }%)`}
                </span>
                {index < array.length - 1 && ", "}
              </React.Fragment>
            );
          });

        const lulusCPMKValue = CPMK.lulusCPMK
          .filter((item) => item.tahunAjaranId === Number(filterTahunAjaran))[0]
          ?.jumlahLulus.toFixed(2);
        const textColorClass =
          Number(lulusCPMKValue) < 65 || !lulusCPMKValue ? "text-red-500" : "";

        return (
          <TableRow key={CPMK.id}>
            <TableCell className={textColorClass}>
              {`${CPMK.kode} (${lulusCPMKValue ? lulusCPMKValue : 0}%)`}
            </TableCell>
            <TableCell>{MKContent}</TableCell>
          </TableRow>
        );
      });

      return [
        <TableRow key={`cpl-${cplItem.id}`}>
          <TableCell
            className={`${cplPerforma < 65 && "text-red-500"}`}
            rowSpan={cplItem.CPMK.length + 1}
          >
            {`${cplItem.kode} (${cplPerforma ? cplPerforma.toFixed(2) : 0}%)`}
          </TableCell>
        </TableRow>,
        ...CPMKRows,
      ];
    });
  };

  return (
    <main className='py-12 flex flex-col gap-4 justify-center items-center'>
      {isLoading ? (
        <div className='flex items-center justify-center h-screen'>
          <Image
            src='/Logo2.png'
            alt='loading'
            width={100}
            height={100}
            className='animate-pulse'
          />
        </div>
      ) : accountData?.role === "Super Admin" ? (
        <>
          <Card className='w-[1200px] mx-auto shadow-lg'>
            <CardHeader className='flex flex-row justify-between items-center'>
              <div className='flex flex-col'>
                <CardTitle>Data Sistem</CardTitle>
                <CardDescription>OBE</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='flex items-center justify-center flex-wrap gap-4 w-full'>
              {dataSistem.map((item) => (
                <Card
                  key={item.name}
                  className='flex items-center justify-between p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer w-64 active:scale-95 text-white bg-[#1976D2] hover:opacity-90 h-[100px]'
                  onClick={() => router.push(getAdminRoutes(item.name))}
                >
                  <p className='font-semibold text-xl'>{item.name}</p>
                  <p className='font-medium text-lg'>{item.count}</p>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className='w-[600px] shadow-lg'>
            <CardHeader className='flex flex-row justify-between items-center'>
              <div className='flex flex-col'>
                <CardTitle>Kunci Perubahan</CardTitle>
                <CardDescription>Data Kurikulum</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='flex items-center justify-center flex-wrap gap-4 w-full'>
              <Button
                className='w-full'
                onClick={async () => {
                  await kunciPerubahan();
                }}
              >
                {kunciData?.kunci ? "Buka Kunci" : "Kunci"}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : accountData?.role === "Admin" ? (
        <Card className='w-[1200px] mx-auto shadow-lg'>
          <CardHeader className='flex flex-row justify-between items-center'>
            <div className='flex flex-col'>
              <CardTitle>Data Prodi</CardTitle>
              <CardDescription>{`Program Studi ${accountData.prodiId}`}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className='flex items-center justify-center flex-wrap gap-4 w-full'>
            {dataCount.map((item) => (
              <Card
                key={item.name}
                className='flex items-center justify-between p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer w-64 active:scale-95 text-white bg-[#1976D2] hover:opacity-90 h-[100px]'
                onClick={() => router.push(getAdminRoutes(item.name))}
              >
                <p className='font-semibold text-xl'>{item.name}</p>
                <p className='font-medium text-lg'>{item.count}</p>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='flex flex-col items-start'>
            <Select
              value={filterTahunAjaran}
              onValueChange={(e) => setFilterTahunAjaran(e)}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Pilih Tahun Ajaran' />
              </SelectTrigger>
              <SelectContent>
                {semester.map((tahun) => (
                  <SelectItem key={tahun.id} value={String(tahun.id)}>
                    {tahun.tahun}-{tahun.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className='w-[1000px]'>
            <CardHeader>
              <div className='flex justify-between'>
                <div>
                  <CardTitle>Mata Kuliah Diampu</CardTitle>
                  <CardDescription>{`Program Studi ${accountData?.prodiId}`}</CardDescription>
                </div>

                <div>
                  <Button
                    onClick={() => {
                      router.push("/dashboard/input/nilai");
                    }}
                  >
                    Input Nilai
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-center'>Kode</TableHead>
                      <TableHead className='flex-1 text-center'>
                        Nama Matakuliah
                      </TableHead>
                      <TableHead className='flex-1 text-center'>
                        Nama Matakuliah Inggris
                      </TableHead>
                      <TableHead className='text-center'>
                        Jumlah Mahasiswa
                      </TableHead>
                      <TableHead className='text-center'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SkeletonTable rows={4} cols={5} />
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-center'>Kode</TableHead>
                      <TableHead className='flex-1 text-center'>
                        Nama Matakuliah
                      </TableHead>
                      <TableHead className='flex-1 text-center'>
                        Nama Matakuliah Inggris
                      </TableHead>
                      <TableHead className='text-center'>
                        Jumlah Mahasiswa
                      </TableHead>
                      <TableHead className='text-center'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderData()}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {accountData?.role === "Kaprodi" && calculatedCPL && (
            <>
              <Card className='w-[1200px] mx-auto'>
                <CardHeader className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <CardTitle>Tabel Rangkuman Evaluasi </CardTitle>
                    <CardDescription>{`Program Studi ${accountData?.prodiId}`}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[8%]'>MK </TableHead>
                        <TableHead className='w-[8%]'>Kelas </TableHead>
                        <TableHead className='w-[8%]'>CPMK </TableHead>
                        <TableHead className='w-[8%]'>CPL</TableHead>
                        <TableHead className='w-[8%]'>
                          Total Nilai Minimal
                        </TableHead>
                        <TableHead className='w-[8%]'>Nilai Masuk</TableHead>
                        <TableHead className='w-[8%]'>Jumlah Lulus</TableHead>
                        <TableHead className='w-[16%]'>
                          Persen Mencapai Nilai Minimal
                        </TableHead>
                        <TableHead className='w-[8%]'>Rata-Rata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderDataRangkuman()}</TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card className='w-[1200px]'>
                <CardHeader className='flex flex-row justify-between items-center'>
                  <div className='flex flex-col'>
                    <CardTitle>Rangkuman Performa CPL</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='flex-1'>CPL</TableHead>
                        <TableHead className='flex-1'>CPMK</TableHead>
                        <TableHead className='flex-1'>MK</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderRangkumanPerforma()}</TableBody>
                  </Table>
                  <CustomRadar data={calculatedCPL} />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </main>
  );
};

export default Page;
