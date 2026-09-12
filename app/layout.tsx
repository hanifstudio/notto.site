import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/satoshi-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-satoshi-loaded",
  display: "swap",
  preload: true,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Orbie — Distinctive HTML pages",
    template: "%s · Orbie",
  },
  description:
    "Distinctive, complete HTML pages you can copy into any coding agent.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Orbie",
    title: "Orbie — Distinctive HTML pages",
    description: "Distinctive, complete HTML pages you can copy into any coding agent.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbie — Distinctive HTML pages",
    description: "Distinctive, complete HTML pages you can copy into any coding agent.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={satoshi.variable}><Providers>{children}</Providers></body>
    </html>
  );
}
