"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navigation";
import Footer from "./footer";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
