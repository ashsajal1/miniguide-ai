import type { Metadata } from "next";
import { Schibsted_Grotesk, Instrument_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "./components/layout/site-shell";
import { ThemeProvider } from "./components/ui/theme-provider";

import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./components/ui/providers";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["700"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "MiniGuide AI - Learn Something New Today",
    template: "%s | MiniGuide AI",
  },
  description:
    "Discover and enroll in high-quality online courses to enhance your skills and advance your career. Learn at your own pace with expert instructors.",
  keywords: [
    "online courses",
    "e-learning",
    "education",
    "online learning",
    "skill development",
    "professional courses",
  ],
  authors: [{ name: "MiniGuide AI Team" }],
  creator: "MiniGuide AI",
  publisher: "MiniGuide AI",
  metadataBase: new URL("https://minicourse.netlify.app"),
  openGraph: {
    title: "MiniGuide AI - Learn Something New Today",
    description:
      "Discover and enroll in high-quality online courses to enhance your skills and advance your career.",
    url: "https://minicourse.netlify.app",
    siteName: "MiniGuide AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MiniGuide AI - Online Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniGuide AI - Learn Something New Today",
    description:
      "Discover and enroll in high-quality online courses to enhance your skills and advance your career.",
    images: ["/twitter-image.jpg"],
    creator: "@minicourse",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${schibsted.variable} ${instrument.variable} ${dmMono.variable} paper-grain antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <SiteShell>{children}</SiteShell>
            </Providers>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
