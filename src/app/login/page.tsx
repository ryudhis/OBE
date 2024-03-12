import React from "react";
import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "Login Page",
  description: "Login Page",
};

const Login = () => {
  return (
    <main>
      <div className="h-screen w-screen bg-white flex flex-col xl:flex-row">
        <div className="w-screen h-[80%] xl:h-screen login bg-cover bg-[#2392EC] xl:bg-white rounded-b-[40px] xl:rounded-none flex flex-col xl:hidden justify-center items-center shadow-[0_4px_4px_0px_#B9B9B9]">
          <img width={135} height={135} src="Logo.png" alt="" />
          <p className="text-[20px] text-white font-semibold tracking-wide">
            Selamat Datang!
          </p>
        </div>
        <div className="hidden xl:flex flex-col w-screen h-screen login bg-cover bg-[#FF5757] xl:bg-white rounded-b-[40px] xl:rounded-none justify-between items-center shadow-[0_4px_4px_0px_#B9B9B9]">
          <div className="flex self-start justify-center items-center ml-3 mt-3">
            <img width={50} height={50} src="Logo.png" alt="" />
            <h3 className="ml-3 text-base font-semibold text-[#2392EC]">OBE</h3>
          </div>
          <img width={443} height={443} src="Logo.png" alt="" />
          <div className="ml-20 self-start flex flex-col mb-24 text-[#2392EC]">
            <h1 className="w-[366px] text-[32px] font-semibold">OBE</h1>
            <p className="w-[600px] font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero
              autem provident suscipit ipsa explicabo necessitatibus possimus
              eum, nostrum adipisci accusamus veritatis voluptatum illum nobis
              aliquid! Architecto, maxime quia. Quaerat, rerum doloribus
              consequuntur ratione accusamus voluptatibus quia amet consequatur
              officia explicabo totam nulla! Unde eum tempore cumque? Molestias,
              iure, eum provident fuga minus adipisci non minima assumenda
              voluptatibus alias quasi voluptate.
            </p>
          </div>
        </div>
        <div className="w-screen xl:w-[40%] h-screen bg-white xl:bg-[#2392EC] flex justify-center items-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
};

export default Login;
