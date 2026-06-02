import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Safiba — Nigeria's Safety Intelligence Platform",
  description:
    "Real-time alerts, missing persons, SOS, and verified community safety data. Built for 200 million Nigerians.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-gray-900" style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
