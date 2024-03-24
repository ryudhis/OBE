"use client";
import axiosConfig from "../../../../../utils/axios";
import React, { useState, useEffect } from "react";

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
    const [pl, setPl] = useState<PLinterface | undefined>();

  const getPL = async (param: string) => {
    try {
      const response = await axiosConfig.get(`api/pl/${param}`);

      if (response.data.status !== 400) {
      } else {
        alert(response.data.message);
      }
      setPl(response.data.data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        // If there is a response from the server
        alert(error.response.data.message);
        console.log(error.response.data);
      } else {
        // If there is no response from the server
        alert("An error occurred while fetching data");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getPL(params.kode);
  });

  if(pl){
    return <div>Kode: {pl.kode}</div>;
  }
}
