"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  return (
    <main className="flex flex-col gap-2 justify-center items-center h-screen">
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="px-2 py-1 border-2 border-slate-700 rounded-sm">
            Input
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Input Data</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/pl");
            }}
          >
            PL
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/cpl");
            }}
          >
            CPL
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/bk");
            }}
          >
            BK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/cpmk");
            }}
          >
            CPMK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/mk");
            }}
          >
            MK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/penilaianCPMK");
            }}
          >
            Penilaian CPMK
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="px-2 py-1 border-2 border-slate-700 rounded-sm">
            Data
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Lihat Data</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/pl");
            }}
          >
            PL
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/cpl");
            }}
          >
            CPL
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/bk");
            }}
          >
            BK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/cpmk");
            }}
          >
            CPMK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/mk");
            }}
          >
            MK
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/data/penilaianCPMK");
            }}
          >
            Penilaian CPMK
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="px-2 py-1 border-2 border-slate-700 rounded-sm">
            Penilaian CPMK
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              router.push("/dashboard/input/penilaianCPMK");
            }}
          >
            Input
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="destructive"
        onClick={() => {
          toast({
            description: "Berhasil Log Out.",
          });
          Cookies.remove("token");
          router.push("/login");
        }}
      >
        Log Out
      </Button>
    </main>
  );
};

export default Page;
