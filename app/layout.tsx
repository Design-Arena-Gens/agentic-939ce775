import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Agentic Fusion Platform",
  description:
    "Unified AI orchestrator blending conversational intelligence, autonomous workflows, and multimodal insight streams."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
