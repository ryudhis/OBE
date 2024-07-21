// contexts/AccountContext.js
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccountData } from "@/utils/api";
import { accountProdi } from "../interface/input";

interface AccountContextType {
  accountData: accountProdi | null;
  fetchData: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | null>(null);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accountData, setAccountData] = useState<accountProdi | null>({} as accountProdi);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getAccountData();
      setAccountData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-center">Loading...</div>;
  }

  return (
    <AccountContext.Provider value={{ accountData, fetchData }}>
      {children}
    </AccountContext.Provider>
  );
};
