"use client";

import { useAccount } from "@/app/contexts/AccountContext";
import { toast } from "@/components/ui/use-toast";
import axios from "@/utils/axios";
import { useState } from "react";

export default function ImageToSvgPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const { accountData } = useAccount();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setImageFile(file);
      convertImageToSvg(file);
    } else {
      alert("Mohon pilih file PNG atau JPEG.");
    }
  };

  const convertImageToSvg = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL();
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
            <image href="${dataUrl}" width="${img.width}" height="${img.height}" />
          </svg>`;
        setSvgContent(svgString);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // const downloadSvg = () => {
  //   const blob = new Blob([svgContent], { type: "image/svg+xml" });
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "converted-image.svg";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // };

  const submitSvg = async () => {
    if (!svgContent) {
      alert("No SVG content to submit.");
      return;
    }

    try {
      await axios.post("/api/account/signature", {
        svg: svgContent, accountId: accountData?.id
      }).then(function (response) {
        if (response.data.status != 400) {
          toast({
            title: "Berhasil Submit",
            description: String(new Date()),
          });
        } else {
          toast({
            title: "Kode Sudah Ada!",
            description: String(new Date()),
            variant: "destructive",
          });
        }
      })
    } catch (error) {
      toast({
        title: "Gagal Submit",
        description: String(new Date()),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Signature</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Pilih Gambar (PNG atau JPEG)
        </label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileUpload}
          className="block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div className="flex flex-col items-center">
        {imageFile && (
          <div>
            <h2 className="font-semibold mb-2">Signature Preview:</h2>
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="rounded shadow max-w-full h-auto"
            />
          </div>
        )}

        {svgContent && (
            <button
              onClick={submitSvg}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Submit Signature
            </button>
        )}
      </div>
    </div>
  );
}
