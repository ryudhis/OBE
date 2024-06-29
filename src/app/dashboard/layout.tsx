import Header from "@/components/Header";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <div className="bg-[#FAFAFA]">{children}</div>
    </div>
  );
};

export default layout;
