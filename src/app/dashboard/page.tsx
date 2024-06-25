"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { accountProdi } from "@/app/interface/input";
import { getAccountData } from "@/utils/api";

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<accountProdi>();

  const fetchData = async () => {
    try {
      const data = await getAccountData();
      setAccount(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="flex flex-col gap-2 justify-center items-center h-screen">
      {isLoading ? (
        <h1>Loading...</h1>
      ) : account?.role === "Admin" ? (
        <h1>Dashboard Super Admin</h1>
      ) : account?.role === "Kaprodi" ? (
        <h1>Dashboard Kaprodi</h1>
      ) : (
        <h1>Dashboard Dosen</h1>
      )}
    </main>
  );
};

export default Page;
