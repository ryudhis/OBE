"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Data = () => {
  return useRouter().push("/dashboard/data/pl");
};

export default Data;
