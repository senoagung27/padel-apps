import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PadelBook — Booking Lapangan Padel",
    template: "%s | PadelBook",
  },
  description:
    "Aplikasi pemesanan lapangan padel mudah dan cepat. Pilih lapangan, pilih waktu, dan pesan sekarang!",
  keywords: ["padel", "booking", "lapangan", "olahraga", "reservasi"],
  authors: [{ name: "PadelBook" }],
  openGraph: {
    title: "PadelBook — Booking Lapangan Padel",
    description:
      "Aplikasi pemesanan lapangan padel mudah dan cepat. Pilih lapangan, pilih waktu, dan pesan sekarang!",
    type: "website",
    locale: "id_ID",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
