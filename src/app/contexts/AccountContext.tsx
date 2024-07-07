// contexts/AccountContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccountData } from "@/utils/api";
import { accountProdi } from "../interface/input";

const AccountContext = createContext<accountProdi | null>(null);

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [account, setAccount] = useState<accountProdi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountData();
        setAccount(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-center">Loading...</div>;
  }

  return (
    <AccountContext.Provider value={account}>
      {children}
    </AccountContext.Provider>
  );
};
