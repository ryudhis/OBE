"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { DataCard } from "@/components/DataCard";

export interface CPLinterface {
  kode: string;
  deskripsi: string;
  BK: BKItem[];
  CPMK: CPMKItem[];
}

export interface CPMKItem {
  kode: string;
  deskripsi: string;
}

export interface BKItem {
  kode: string;
  deskripsi: string;
  min: number;
  max: number;
}

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [cpl, setCPl] = useState<CPLinterface | undefined>();
  const [bk, setBK] = useState<BKItem[] | undefined>([]);
  const [cpmk,setCPMK] = useState<CPMKItem[] | undefined>([]);
  const [prevSelected1, setPrevSelected1] = useState<string[]>([]);
  const [selected1, setSelected1] = useState<string[]>([]);
  const [prevSelected2, setPrevSelected2] = useState<string[]>([]);
  const [selected2, setSelected2] = useState<string[]>([]);
  const [searchBK, setSearchBK] = useState<string>("");
  const [searchCPMK, setSearchCPMK] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const filteredBK = bk?.filter((bk) =>
    bk.kode.toLowerCase().includes(searchBK.toLowerCase())
  );

  const filteredCPMK = cpmk?.filter((cpmk) =>
    cpmk.kode.toLowerCase().includes(searchCPMK.toLowerCase())
  );

  const getCPL = async () => {
    try {
      const response = await axiosConfig.get(`api/cpl/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setCPl(response.data.data);

      const prevSelected1 = response.data.data.BK.map(
        (item: BKItem) => item.kode
      );

      const prevSelected2 = response.data.data.CPMK.map(
        (item: CPMKItem) => item.kode
      );

      setSelected1(prevSelected1);
      setPrevSelected1(prevSelected1);

      setSelected2(prevSelected2);
      setPrevSelected2(prevSelected2);
    } catch (error: any) {
      throw error;
    }
  };

  const getAllBK = async () => {
    try {
      const response = await axiosConfig.get("api/bk");

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setBK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const getAllCPMK = async () => {
    try {
      const response = await axiosConfig.get("api/cpmk");

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPMK(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCheck1 = (kode: string) => {
    setSelected1((prevSelected1) => {
      if (!prevSelected1.includes(kode)) {
        return [...prevSelected1, kode];
      } else {
        return prevSelected1.filter((item) => item !== kode);
      }
    });
  };

  const handleCheck2 = (kode: string) => {
    setSelected2((prevSelected2) => {
      if (!prevSelected2.includes(kode)) {
        return [...prevSelected2, kode];
      } else {
        return prevSelected2.filter((item) => item !== kode);
      }
    });
  };


  const updateBK = async () => {
    let addedBKId: string[] = [];
    let removedBKId: string[] = [];

    addedBKId = selected1.filter((item) => !prevSelected1.includes(item));
    removedBKId = prevSelected1.filter((item) => !selected1.includes(item));

    const payload = {
      kode: cpl?.kode,
      deskripsi: cpl?.deskripsi,
      addedBKId: addedBKId,
      removedBKId: removedBKId,
      addedCPMKId: [],
      removedCPMKId: []
    };

    console.log(payload);

    try {
      const response = await axiosConfig.patch(`api/cpl/${kode}`, payload);
      setRefresh(!refresh);
      if (response.data.status == 200 || response.data.status == 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        console.log(response.data)
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const updateCPMK = async () => {
    let addedCPMKId: string[] = [];
    let removedCPMKId: string[] = [];

    addedCPMKId = selected2.filter((item) => !prevSelected2.includes(item));
    removedCPMKId = prevSelected2.filter((item) => !selected2.includes(item));

    const payload = {
      kode: cpl?.kode,
      deskripsi: cpl?.deskripsi,
      addedCPMKId: addedCPMKId,
      removedCPMKId: removedCPMKId,
      addedBKId: [],
      removedBKId: []
    };

    try {
      const response = await axiosConfig.patch(`api/cpl/${kode}`, payload);
      setRefresh(!refresh);
      if (response.data.status == 200 || response.data.status == 201) {
        toast({
          title: response.data.message,
          variant: "default",
        });
        setRefresh(!refresh);
      } else {
        toast({
          title: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  // ONLY FIRST TIME
  useEffect(() => {
    getAllBK();
    getAllCPMK();
  }, []);

  useEffect(() => {
    getCPL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (cpl) {
    return (
      <main className="flex flex-col gap-5 w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5">
        

        {/* HEADER */}
        <div className="flex flex-row justify-between items-center mb-5">
          <div className=" font-bold text-xl">Sambungkan BK</div>
          <input
            type="text"
            className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
            value={searchBK}
            placeholder="Cari..."
            onChange={(e) => setSearchBK(e.target.value)}
          />
        </div>

        {/* LIST OF BK */}
        <div className="grid grid-cols-4 gap-4">
          {filteredBK && filteredBK.length > 0 ? (
            filteredBK?.map((bk, index) => {
              return (
                <DataCard<BKItem>
                  key={index}
                  selected={selected1}
                  handleCheck={handleCheck1}
                  data={bk}
                />
              );
            })
          ) : (
            <div className="text-sm">PL Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateBK}
          type="button"
          className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600"
        >
          Simpan
        </button>

        <div className="flex flex-row justify-between items-center mb-5">
          <div className=" font-bold text-xl">Sambungkan CPMK</div>
          <input
            type="text"
            className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
            value={searchCPMK}
            placeholder="Cari..."
            onChange={(e) => setSearchCPMK(e.target.value)}
          />
        </div>

        {/* LIST OF CPMK */}
        <div className="grid grid-cols-4 gap-4">
          {filteredCPMK && filteredCPMK.length > 0 ? (
            filteredCPMK?.map((cpmk, index) => {
              return (
                <DataCard<CPMKItem>
                  key={index}
                  selected={selected2}
                  handleCheck={handleCheck2}
                  data={cpmk}
                />
              );
            })
          ) : (
            <div className="text-sm">CPMK Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateCPMK}
          type="button"
          className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600"
        >
          Simpan
        </button>
      </main>
    );
  }
}
