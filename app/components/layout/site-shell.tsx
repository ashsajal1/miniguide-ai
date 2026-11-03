"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import AnnouncementBar from "@/app/components/landing/announcement-bar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isReader =
    segments[0] === "course" && segments[1] === "learn" && segments.length >= 4;

  if (isReader) {
    return (
      <main id="main" className="min-h-dvh bg-transparent">
        {children}
      </main>
    );
  }

  return (
    <>
      {pathname === "/" && <AnnouncementBar />}
      <Navbar />
      <main id="main" className="min-h-[calc(100vh-4.5rem)] bg-transparent">
        {children}
      </main>
      <Footer />
    </>
  );
}
