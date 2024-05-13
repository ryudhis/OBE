// components/ExcelUpload.js
"use client";
import React, { useState } from "react";

const ExcelUpload = ({ handleFile }: { handleFile: any }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleInputChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default ExcelUpload;
