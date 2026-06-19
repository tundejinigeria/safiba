import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Safiba — Nigeria's Community-Powered Safety Platform",
    template: "%s | Safiba",
  },
  description:
    "Real-time safety alerts, missing persons reports, SOS emergency features, and verified community safety data across all 36 states + FCT. Built for 200 million Nigerians.",
  keywords: [
    "safety alerts Nigeria",
    "community safety platform",
    "real-time incident reporting",
    "missing persons Nigeria",
    "SOS emergency app Nigeria",
    "neighbourhood safety",
    "crime alerts Nigeria",
    "safety awareness",
    "Safiba",
    "Tundeji Technologies",
    "verified safety reports",
    "route safety check Nigeria",
  ],
  authors: [{ name: "Tundeji Technologies Ltd" }],
  creator: "Tundeji Technologies Ltd",
  publisher: "Tundeji Technologies Ltd",
  metadataBase: new URL("https://safiba.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://safiba.com",
    siteName: "Safiba",
    title: "Safiba — Nigeria's Community-Powered Safety Platform",
    description:
      "Real-time safety alerts from your neighbourhood. Report incidents, find missing persons, trigger SOS — all verified by your community.",
    images: [
      {
        url: "/safiba-og.png",
        width: 1200,
        height: 630,
        alt: "Safiba — Know what's happening around you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safiba — Nigeria's Community-Powered Safety Platform",
    description:
      "Real-time safety alerts from your neighbourhood. Report incidents, find missing persons, trigger SOS — all verified by your community.",
    images: ["/safiba-og.png"],
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
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
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
