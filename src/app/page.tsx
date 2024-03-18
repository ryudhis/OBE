"use client";
import { useRouter } from "next/navigation";

const Page = () => {
  const router=useRouter()
  router.push("/dashboard");
  
  return (
    <p>please wait...</p>
  );
};

export default Page;
