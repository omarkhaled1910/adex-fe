"use client";
import type { Metadata } from "next";
import {
  Hero,
  ProblemSection,
  CompetitiveTable,
  ProofOfPlay,
  TechnicalMoat,
  Architecture,
  CTASection,
  Navbar,
  Footer,
} from "@/components/landing";

// export const metadata: Metadata = {
//   title: "AdExchange | The Ad Tech Revolution - 95% to Publishers",
//   description:
//     "Replace five legacy intermediaries with cryptographic proofs and instant settlement. The future of programmatic advertising is transparent, instant, and fair.",
//   keywords: [
//     "programmatic advertising",
//     "web3 advertising",
//     "blockchain ad tech",
//     "publisher monetization",
//     "real-time bidding",
//     "ad exchange",
//     "crypto payments",
//   ],
//   openGraph: {
//     title: "AdExchange | The Ad Tech Revolution",
//     description:
//       "Replace five legacy intermediaries with cryptographic proofs and instant settlement.",
//     type: "website",
//     locale: "en_US",
//     siteName: "AdExchange",
//     images: [
//       {
//         url: "/og-image.png",
//         width: 1200,
//         height: 630,
//         alt: "AdExchange - Web3 Advertising Platform",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "AdExchange | The Ad Tech Revolution",
//     description:
//       "Replace five legacy intermediaries with cryptographic proofs and instant settlement.",
//     images: ["/og-image.png"],
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-white overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Problem Section - The $0.50 Problem */}
        <ProblemSection />

        {/* Competitive Landscape Table */}
        <CompetitiveTable />

        {/* Proof of Play Innovation */}
        <ProofOfPlay />

        {/* Technical Moat */}
        <TechnicalMoat />

        {/* Architecture / How It Works */}
        <Architecture />

        {/* CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
