import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OBE IF ITERA",
  description: "Institut Teknologi Sumatera | Teknik Informatika",
  icons: {
    icon: [
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico", 
    apple: "/apple-touch-icon.png", 
  },
  manifest: "/site.webmanifest", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
