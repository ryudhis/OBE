"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa6";
// import axiosConfig from "../../../utils/axios";
// import Cookies from "js-cookie";

const LoginForm = () => {
  const router = useRouter();
  const [passwordType, setPasswordType] = useState("password");
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const handleInput = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  //   const togglePassword = (e: any) => {
  //     e.preventDefault();
  //     if (passwordType === "password") {
  //       setPasswordType("text");
  //       return;
  //     }
  //     setPasswordType("password");
  //   };

  //   // LOGIN
  //   const signIn = (e) => {
  //     e.preventDefault();

  //     const data = {
  //       email: inputs.email,
  //       password: inputs.password,
  //     };

  //     axiosConfig
  //       .post("api/login", data)
  //       .then(function (response) {
  //         if (response.data.status != 400) {
  //           Cookies.set("token", response.data.token, { expires: 1 });
  //           router.push("/dashboard");
  //         } else {
  //           alert(response.data.message);
  //         }
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //         alert(error.data.message);
  //       });
  //   };

  return (
    // FORM LOGIN
    <form className="flex flex-col w-[80%] xl:w-[60%] gap-5 -mt-12">
      <div className="hidden text-[25px] font-bold text-white xl:flex xl:flex-col -mb-3">
        <h1 className="text-[50px] font-semibold">Halo!</h1>
        <p className="text-[18px] font-normal -mt-2 mb-6">
          Silahkan masuk ke dalam akun anda.
        </p>
      </div>
      <div className="text-[25px] font-bold text-[#2392EC] xl:hidden -mb-3">
        Log In
      </div>
      {/* INPUT FIELD */}
      <div className="input input-bordered flex items-center">
        <FaUser className="scale-125 text-[#2392EC] xl:text-white" />
        <input
          name="email"
          value={inputs.email}
          onChange={handleInput}
          placeholder="Username"
          type="text"
          className="p-2 ml-2 max-w-full w-full rounded-xl bg-[#2392EC] xl:bg-white placeholder:text-slate-100 xl:placeholder:text-slate-500"
        />
      </div>
      <div className="input input-bordered flex items-center">
        <FaLock className="scale-125 text-[#2392EC] xl:text-white" />
        <input
          name="password"
          value={inputs.password}
          onChange={handleInput}
          placeholder="Password"
          type={passwordType}
          className="p-2 ml-2 max-w-full w-full rounded-xl bg-[#2392EC] xl:bg-white placeholder:text-slate-100 xl:placeholder:text-slate-500"
        />
      </div>
      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="btn xl:border-black text-white xl:text-[#2392EC] font-medium xl:font-semibold text-[20px] xl:text-[22px] bg-[#2392EC] xl:bg-white rounded-[26px] w-[175px] self-center normal-case"
      >
        Log In
      </button>
    </form>
  );
};

export default LoginForm;
