import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PublicShell from "./components/PublicShell";
import { CartProvider } from "./context/cartContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shantymacpleasures.com"),
  title: { default: "ShantyMac Pleasures | Montego Bay, Jamaica", template: "%s | ShantyMac Pleasures" },
  description: "Discover a curated collection of intimate products from ShantyMac Pleasures in Montego Bay, Jamaica.",
  openGraph: { type: "website", siteName: "ShantyMac Pleasures", locale: "en_JM", images: ["/images/about.jpeg"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
          <PublicShell>{children}</PublicShell>
        </CartProvider>
      </body>
    </html>
  );
}
