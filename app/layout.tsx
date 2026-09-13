import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/app/providers";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading-loaded",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Notto — Distinctive HTML pages",
    template: "%s · Notto",
  },
  description:
    "Distinctive, complete HTML pages you can copy into any coding agent.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Notto",
    title: "Notto — Distinctive HTML pages",
    description: "Distinctive, complete HTML pages you can copy into any coding agent.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notto — Distinctive HTML pages",
    description: "Distinctive, complete HTML pages you can copy into any coding agent.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={bricolageGrotesque.variable}><Providers>{children}</Providers></body>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="d4d9db45-f8af-4f20-951e-b7937c28648d"
        strategy="afterInteractive"
      />
    </html>
  );
}
