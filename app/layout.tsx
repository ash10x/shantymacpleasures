import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/navigation";
import Footer from "./components/footer";
import { CartProvider } from "./context/cartContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shantymac Pleasures",
  description:
    "A collection of delightful and whimsical pleasures curated by Shantymac.",
  icons: {
    icon: "/logo/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
