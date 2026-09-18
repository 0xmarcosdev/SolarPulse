import type { Metadata } from "next";
import { Geist, Geist_Mono, Iceland, Quantico, Kode_Mono } from "next/font/google";
import "./globals.css";

const iceland = Iceland({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const quantico = Quantico({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
});

const kodeMono = Kode_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolarPulse",
  description: "Dashboard local de predicción solar y monitor EcoFlow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${iceland.variable} ${quantico.variable} ${kodeMono.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">{children}</body>
    </html>
  );
}

