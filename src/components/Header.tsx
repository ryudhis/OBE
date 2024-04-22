"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <div>
      <header className="flex justify-between items-center py-4 px-6 bg-slate-800">
        <h1
          className="text-white cursor-pointer font-bold text-2xl tracking-widest"
          onClick={() => router.push("/dashboard")}
        >
          OBE
        </h1>
      </header>
    </div>
  );
};

export default Header;
