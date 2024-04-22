"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <div>
      <header className="flex justify-between items-center py-2 px-4 bg-slate-800">
        <h1
          className="text-white cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </h1>
      </header>
    </div>
  );
};

export default Header;
