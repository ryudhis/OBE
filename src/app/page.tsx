"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect } from "react"; 

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token"); 
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login")
    }
  }, [router]); 

  return <p>Please Wait...</p>;
};

export default Page;