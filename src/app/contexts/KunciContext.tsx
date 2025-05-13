// contexts/AccountContext.js
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getKunci } from "@/utils/api";
import Image from "next/image";

interface KunciContextType {
  kunciSistem: Kunci | null;
  fetchData: () => Promise<void>;
}

const KunciContext = createContext<KunciContextType | null>(null);

export const useKunci = () => {
  const context = useContext(KunciContext);
  if (!context) {
    throw new Error("useKunci must be used within a KunciProvider");
  }
  return context;
};

export const KunciProvider = ({ children }: { children: ReactNode }) => {
  const [kunciSistem, setKunciSistem] = useState<Kunci | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getKunci();
      setKunciSistem(data);
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
    return (
      <div className='flex items-center justify-center h-screen'>
        <Image
          src='/Logo2.png'
          alt='loading'
          width={100}
          height={100}
          className='animate-pulse'
        />
      </div>
    );
  }

  return (
    <KunciContext.Provider value={{ kunciSistem, fetchData }}>
      {children}
    </KunciContext.Provider>
  );
};
