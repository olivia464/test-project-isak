import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const haasAlike = Inter({
  variable: "--font-haas",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "To Do + AI",
  description: "Tiny to-do app with a Claude-powered task breakdown helper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${haasAlike.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
