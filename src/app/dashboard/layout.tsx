// layout.js
import Header from "@/components/Header";
import React from "react";
import { AccountProvider } from "@/app/contexts/AccountContext";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountProvider>
      <div>
        <Header />
        <div>{children}</div>
      </div>
    </AccountProvider>
  );
};

export default layout;
