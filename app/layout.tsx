import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdExchange | Real-Time Programmatic Advertising",
  description:
    "Decentralized Ad Exchange with real-time bidding and blockchain settlement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <div className="grid-pattern fixed inset-0 pointer-events-none" />
        <main className="relative z-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
