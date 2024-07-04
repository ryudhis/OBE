"use client";
import axiosConfig from "@utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
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
import { Button } from "@/components/ui/button";
import { getAccountData } from "@/utils/api";

export interface CPLItem {
  id: string;
  kode: string;
  deskripsi: string;
  keterangan: string;
}

export interface CPMKItem {
  id: string;
  kode: string;
  deskripsi: string;
  CPL: CPLItem[];
  penilaianCPMK: PCPMKItem[];
}

export interface PCPMKItem {
  kriteria: kriteriaItem[];
}

export interface kriteriaItem {
  bobot: number;
  kriteria: string;
}

export default function Page() {
  const [account, setAccount] = useState(null);
  const [cpl, setCPl] = useState<CPLItem[]>([]);
  const [cpmk, setCPMK] = useState<CPMKItem[]>([]);
  const [selected, setSelected] = useState<{ [cplId: string]: Set<string> }>(
    {}
  );
  const [refresh, setRefresh] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const data = await getAccountData();
      setAccount(data);
      await getAllCPL(data.prodiId);
      await getAllCPMK(data.prodiId);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllCPL = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/cpl?prodi=${prodiId}`);
      const cplData = response.data.data;
      setCPl(cplData);

      // Initialize the selected state with empty sets for each CPL
      const initialSelected: { [cplId: string]: Set<string> } = {};
      cplData.forEach((cplItem: CPLItem) => {
        initialSelected[cplItem.id] = new Set();
      });
      setSelected(initialSelected);
    } catch (error: any) {
      console.error(error);
    }
  };

  const getAllCPMK = async (prodiId: string) => {
    try {
      const response = await axiosConfig.get(`api/cpmk?prodi=${prodiId}`);
      const cpmkData = response.data.data;
      setCPMK(cpmkData);

      // Populate the selected state with existing relationships
      setSelected((prevSelected) => {
        const newSelected = { ...prevSelected };
        cpmkData.forEach((cpmkItem: CPMKItem) => {
          cpmkItem.CPL.forEach((cplItem: CPLItem) => {
            newSelected[cplItem.id].add(cpmkItem.id);
          });
        });
        return newSelected;
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleCheck = (cplId: string, cpmkId: string) => {
    setSelected((prevSelected) => {
      const newSelected = { ...prevSelected };

      if (newSelected[cplId]?.has(cpmkId)) {
        const updatedSet = new Set(newSelected[cplId]);
        updatedSet.delete(cpmkId);
        newSelected[cplId] = updatedSet;
      } else {
        if (!newSelected[cplId]) {
          newSelected[cplId] = new Set();
        }
        const updatedSet = new Set(newSelected[cplId]);
        updatedSet.add(cpmkId);
        newSelected[cplId] = updatedSet;
      }

      return newSelected;
    });
  };

  const updateRelation = async () => {
    const data = Object.entries(selected).map(([cplId, cpmkIds]) => ({
      cplId,
      cpmkIds: Array.from(cpmkIds),
    }));

    console.log(data);

    try {
      const response = await axiosConfig.patch(`api/cpl/relasiCPMK`, data);
      setRefresh(!refresh);
      if (response.data.status === 200 || response.data.status === 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
      } else {
        console.error(response.data);
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotalBobot = (penilaianCPMK: PCPMKItem[]) => {
    return penilaianCPMK.reduce((total, pcpmk) => {
      return (
        total +
        pcpmk.kriteria.reduce((subTotal, kriteria) => {
          return subTotal + kriteria.bobot;
        }, 0)
      );
    }, 0);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (cpl.length === 0 || cpmk.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <main className='flex flex-col gap-5 w-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5'>
      <Card className='w-[1000px] self-center'>
        <CardHeader className='flex flex-row'>
          <div className='flex flex-col'>
            <CardTitle>Pemetaan Data</CardTitle>
            <CardDescription>CPL - CPMK</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>CPMK</TableCell>
                  {cpl.map((cplItem) => (
                    <TableCell key={cplItem.id}>{cplItem.kode}</TableCell>
                  ))}
                  <TableCell>Bobot CPMK</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cpmk.map((cpmkItem, index) => (
                  <TableRow key={cpmkItem.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cpmkItem.kode}</TableCell>
                    {cpl.map((cplItem) => (
                      <TableCell key={cplItem.id}>
                        <input
                          type='checkbox'
                          checked={
                            selected[cplItem.id]?.has(cpmkItem.id) || false
                          }
                          onChange={() => handleCheck(cplItem.id, cpmkItem.id)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      {calculateTotalBobot(cpmkItem.penilaianCPMK)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={updateRelation}>Simpan</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
