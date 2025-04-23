// layout.js
import Header from "@/components/Header";
import React from "react";
import { AccountProvider } from "@/app/contexts/AccountContext";
import { KunciProvider } from "@/app/contexts/KunciContext";
import { CustomBreadCrumbs } from "@/components/CustomBreadCrumbs";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountProvider>
      <KunciProvider>
        <div>
          <Header />
          <div>{children}</div>
        </div>
      </KunciProvider>
      <div>
        <Header />
        <CustomBreadCrumbs />
        <div>{children}</div>
      </div>
    </AccountProvider>
  );
};

export default layout;
