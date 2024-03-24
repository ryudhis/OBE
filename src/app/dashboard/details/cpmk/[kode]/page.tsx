"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { DataCard } from "@/components/DataCard";

export interface CPMKInterface {
  kode: string;
  deskripsi: string;
  CPMK: MKItem[];
}

export interface MKItem {
  kode: string;
  deskripsi: string;
}

export default function Page({ params }: { params: { kode: string } }) {
  const { kode } = params;
  const [cpmk, setCpmk] = useState<CPMKInterface | undefined>();
  const [mk, setMk] = useState<MKItem[] | undefined>([]);
  const [prevSelected, setPrevSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  const filteredMK = mk?.filter((mk) =>
    mk.kode.toLowerCase().includes(search.toLowerCase())
  );

  const getCPMK = async () => {
    try {
      const response = await axiosConfig.get(`api/cpmk/${kode}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }

      setCpmk(response.data.data);
      const prevSelected = response.data.data.MK.map(
        (item: MKItem) => item.kode
      );

      setSelected(prevSelected);
      setPrevSelected(prevSelected);
    } catch (error: any) {
      throw error;
    }
  };
  const getAllMK = async () => {
    try {
      const response = await axiosConfig.get("api/mk");

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setMk(response.data.data);
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

  const updateMK = async () => {
    let addedMKId: string[] = [];
    let removedMKId: string[] = [];

    addedMKId = selected.filter((item) => !prevSelected.includes(item));
    removedMKId = prevSelected.filter((item) => !selected.includes(item));

    const payload = {
      kode: cpmk?.kode,
      deskripsi: cpmk?.deskripsi,
      addedMKId: addedMKId,
      removedMKId: removedMKId,
    };

    console.log(payload);

    try {
      const response = await axiosConfig.patch(`api/cpmk/${kode}`, payload);
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
    getAllMK();
  }, []);

  useEffect(() => {
    getCPMK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  if (cpmk) {
    return (
      <main className="w-screen h-screen max-w-7xl mx-auto pt-20 bg-[#FAFAFA] p-5">
        {/* HEADER */}
        <div className="flex flex-row justify-between items-center mb-5">
          <div className=" font-bold text-xl">Sambungkan MK</div>
          <input
            type="text"
            className="p-2 border-[1px] rounded-md border-gray-400 outline-none"
            value={search}
            placeholder="Cari..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST OF MK */}
        <div className="grid grid-cols-4 gap-4">
          {filteredMK && filteredMK.length > 0 ? (
            filteredMK?.map((mk, index) => {
              return (
                <DataCard<MKItem>
                  key={index}
                  selected={selected}
                  handleCheck={handleCheck}
                  data={mk}
                />
              );
            })
          ) : (
            <div className="text-sm">MK Tidak Ditemukan</div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={updateMK}
          type="button"
          className="w-full p-2 rounded-md bg-blue-500 text-white mt-5 ease-in-out duration-200 hover:bg-blue-600"
        >
          Simpan
        </button>
      </main>
    );
  }
}
