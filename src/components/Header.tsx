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

const Header = () => {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div>
      <header className="flex justify-between items-center py-4 px-6 bg-slate-800">
        <h1
          className="text-white cursor-pointer font-bold text-2xl tracking-widest"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          OBE
        </h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="px-4 py-2 border-1 bg-white border-slate-900 rounded-md">
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
              <DropdownMenuItem
                onClick={() => {
                  router.push("/dashboard/input/mahasiswa");
                }}
              >
                Mahasiswa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/dashboard/input/nilai");
                }}
              >
                Nilai
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/dashboard/input/akun");
                }}
              >
                Akun
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="px-4 py-2 border-1 bg-white border-slate-900 rounded-md">
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
              <DropdownMenuItem
                onClick={() => {
                  router.push("/dashboard/data/mahasiswa");
                }}
              >
                Mahasiswa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/dashboard/data/nilai");
                }}
              >
                Nilai
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
        </div>
      </header>
    </div>
  );
};

export default Header;
