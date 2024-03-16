"use client";
import React, { useState } from "react";
import axiosConfig from "../../../utils/axios";

export interface pl {
  kode: string;
  deskripsi: string;
}

const initialInputs: pl = { kode: "", deskripsi: "" };

const PLScreen = () => {
  const [inputs, setInputs] = useState<pl>(initialInputs);

  const handleInput = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const addPL = (e: any) => {
    e.preventDefault();

    const data = {
      kode: "PL-" + inputs.kode,
      deskripsi: inputs.deskripsi,
    };

    axiosConfig
      .post("api/pl", data)
      .then(function (response) {
        if (response.data.status != 400) {
          alert("Berhasil menambahkan data PL!");
        } else {
          alert(response.data.message);
        }
      })
      .catch(function (error) {
        alert(error.data.message);
        console.log(error);
      });

    window.location.reload();
  };

  return (
    <main className="flex">
      <div className="bg-[#F2F1EF] w-full m-[7px] mt-[56px] rounded-[5px] xl:rounded-[20px] p-[7px] xl:w-[80%] xl:mx-auto xl:my-10 xl:px-[57px] xl:mt-[125px] xl:py-[25px]">
        <div className="text-sm breadcrumbs font-bold p-0">
          <ul className="text-[12px] xl:text-xl">
            <li>
              <a href="">Input Data</a>
            </li>
            <li>PL</li>
          </ul>
        </div>

        <form
          onSubmit={addPL}
          className="flex flex-col gap-[7px] text-[12px] xl:text-base my-2 xl:mt-6"
        >
          <div className="flex gap-3 xl:gap-4 items-center">
            <label
              className="w-[23%] xl:w-[18%] text-end font-medium"
              htmlFor=""
            >
              Kode
              <span className="text-red-500 absolute mt-[-6px]">*</span>
              &nbsp;PL-
            </label>
            <input
              className="w-[77%] xl:w-[82%] h-9 xl:h-11 border-[1.5px] border-[#D5D8DE] rounded-sm p-2"
              type="text"
              name="kode"
              id="kode"
              value={inputs.kode}
              onChange={handleInput}
              required
            />
          </div>

          <div className="flex gap-3 xl:gap-4 items-center">
            <label
              className="w-[23%] xl:w-[18%] text-end font-medium leading-[1.2]"
              htmlFor=""
            >
              Deskripsi
              <span className="text-red-500 absolute mt-[-20px] xl:mt-[-6px]">
                *
              </span>
            </label>
            <input
              className="w-[77%] xl:w-[82%] h-9 xl:h-11 border-[1.5px] border-[#D5D8DE] rounded-sm p-2"
              type="text"
              name="deskripsi"
              id="deskripsi"
              value={inputs.deskripsi}
              onChange={handleInput}
              required
            />
          </div>

          <button
            type="submit"
            name="tambah"
            id="tambah"
            className="bg-[#FF5757;] w-[110px] xl:w-[180px] xl:h-[50px] h-[35px] self-end mt-3 rounded-[10px] xl:rounded-[15px] text-white font-semibold text-sans text-[14px] xl:text-xl p-2 xl:p-5 flex items-center gap-1 xl:gap-3"
          >
            <svg
              className="xl:w-[21px] xl:h-[21px]"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle cx="9" cy="9" r="6.75" fill="white" />
              <path
                d="M9 11.25L9 6.75"
                stroke="#222222"
                stroke-width="1.2"
                stroke-linecap="square"
              />
              <path
                d="M11.25 9L6.75 9"
                stroke="#222222"
                stroke-width="1.2"
                stroke-linecap="square"
              />
            </svg>
            Tambahkan
          </button>
        </form>
      </div>
    </main>
  );
};

export default PLScreen;
