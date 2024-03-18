"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  return (
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
  );
};

export default Page;
