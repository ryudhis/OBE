"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { CPLCard } from "@/components/cpl/CPLCard";
import { toast } from "@/components/ui/use-toast";

export interface PLinterface {
  kode: string;
  deskripsi: string;
  CPL: CPLItem[];
}

interface CPLItem {
  kode: string;
  deskripsi: string;
}

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [pl, setPl] = useState<PLinterface | undefined>();
  const [cpl, setCPL] = useState<CPLItem[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const filteredCPL = cpl?.filter((cpl) =>
    cpl.kode.toLowerCase().includes(search.toLowerCase())
  );

  const getPL = async () => {
    try {
      const response = await axiosConfig.get(`api/pl/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setPl(response.data.data);
      const prevSelected = response.data.data.CPL.map(
        (item: CPLItem) => item.kode
      );

      setSelected(prevSelected);
      setPrevSelected(prevSelected);
    } catch (error: any) {
      throw error;
    }
  };
  const getAllCPL = async () => {
    try {
      const response = await axiosConfig.get("api/cpl");

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setCPL(response.data.data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCheck = (kode: string) => {
    setSelected((prevSelected) => {
      if (!prevSelected.includes(kode)) {
        return [...prevSelected, kode];
      } else {
        return prevSelected.filter((item) => item !== kode);
      }
    });
  };
  
  const updateCPL = async () => {
    let addedCPLId: string[] = [];
    let removedCPLId: string[] = [];

    addedCPLId = selected.filter((item) => !prevSelected.includes(item));
    removedCPLId = prevSelected.filter((item) => !selected.includes(item));

    const payload = {
      kode: pl?.kode,
      deskripsi: pl?.deskripsi,
      addedCPLId: addedCPLId,
      removedCPLId: removedCPLId,
    };

    try {
      const response = await axiosConfig.patch(`api/pl/${kode}`, payload);
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
    getAllCPL();
  }, []);

  useEffect(() => {
    getPL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (pl) {
    return (
      <main className="w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5">
        {/* HEADER */}
        <div className="flex flex-row justify-between items-center mb-5">
          <div className=" font-bold text-xl">Sambungkan CPL</div>
          <input
            type="text"
            className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
            value={search}
            placeholder="Cari..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST OF CPL */}
        <div className="grid grid-cols-4 gap-4">
          {filteredCPL && filteredCPL.length > 0 ? (
            filteredCPL?.map((cpl, index) => {
              return (
                <CPLCard
                  key={index}
                  cpl={cpl}
                  selected={selected}
                  handleCheck={handleCheck}
                />
              );
            })
          ) : (
            <div className="text-sm">CPL Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateCPL}
          type="button"
          className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600"
        >
          Simpan
        </button>
      </main>
    );
  }
}
