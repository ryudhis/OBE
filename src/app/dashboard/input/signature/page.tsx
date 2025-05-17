"use client";

import type React from "react";

import { useAccount } from "@/app/contexts/AccountContext";
import { toast } from "@/components/ui/use-toast";
import axios from "@/utils/axios";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageToSvgPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isCropped, setIsCropped] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const { accountData } = useAccount();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setImageFile(file);
      setIsCropped(false);
      setSvgContent("");
      setCroppedImage(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Format Tidak Sesuai",
        description: "Mohon pilih file PNG atau JPEG.",
        variant: "destructive",
      });
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.crossOrigin = "anonymous";
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = 100;
    canvas.height = 100;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      100,
      100
    );

    return canvas.toDataURL("image/png");
  };

  const handleCropImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setIsCropped(true);

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <image href="${croppedImg}" width="100" height="100" />
        </svg>`;
      setSvgContent(svgString);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Gagal meng-crop gambar.",
        variant: "destructive",
      });
    }
  };

  const submitSvg = async () => {
    if (!svgContent) {
      toast({
        title: "No SVG Content",
        description: "Mohon crop gambar terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post("/api/account/signature", {
        svg: svgContent,
        accountId: accountData?.id,
      });

      if (response.data.status !== 400) {
        toast({
          title: "Berhasil Submit",
          description: String(new Date()),
        });
      } else {
        toast({
          title: "Gagal Submit!",
          description: String(new Date()),
          variant: "destructive",
        });
      }
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
        <p className="text-sm text-gray-500 mt-1">
          Gambar akan diubah menjadi format 1:1 (persegi) dengan ukuran 100x100
          pixel
        </p>
      </div>

      {imageSrc && !isCropped && (
        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-4">Crop ke rasio 1:1</h2>
          <div className="relative h-[300px] w-full mb-4">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center mb-4">
            <span className="mr-2 text-sm">Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <Button onClick={handleCropImage} className="w-full">
            Crop Image
          </Button>
        </Card>
      )}

      <div className="flex flex-col items-center">
        {croppedImage && isCropped && (
          <div className="mb-6 text-center">
            <h2 className="font-semibold mb-2">Signature Preview (100x100):</h2>
            <div className="border border-gray-300 inline-block p-2 rounded">
              <img
                src={croppedImage || "/placeholder.svg"}
                alt="Cropped Preview"
                className="w-[100px] h-[100px]"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Gambar sudah dicrop menjadi rasio 1:1
            </p>
          </div>
        )}

        {svgContent && (
          <Button
            onClick={submitSvg}
            className="mt-4 px-4 py-2 bg-green-600 text-white hover:bg-green-700"
          >
            Submit Signature
          </Button>
        )}
      </div>
    </div>
  );
}
