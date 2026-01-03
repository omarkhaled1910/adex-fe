"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="text-center mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Web3 Programmatic Advertising
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            The Ad Tech Revolution:
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              95% to Publishers
            </span>
            , Not Middlemen
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Replace five legacy intermediaries with cryptographic proofs and
            instant settlement
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
              data-analytics="hero-cta-demo"
            >
              <Play className="w-5 h-5" />
              See the Demo
            </a>
            <a
              href="#competitive-landscape"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              data-analytics="hero-cta-pitch"
            >
              Read the Pitch Deck
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        {/* Hero Visual - Animated Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {/* Traditional Flow - Left Side */}
          <div className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              Traditional Ad Tech
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Advertiser Pays
                </span>
                <span className="text-lg font-bold text-gray-900">$1.00</span>
              </div>

              <MiddlemanStep label="DSP Fee" fee="-$0.15" delay={0.6} />
              <MiddlemanStep label="Exchange Fee" fee="-$0.10" delay={0.8} />
              <MiddlemanStep label="SSP Fee" fee="-$0.15" delay={1.0} />
              <MiddlemanStep
                label="Fraud Verification"
                fee="-$0.05"
                delay={1.2}
              />
              <MiddlemanStep label="Ad Server" fee="-$0.05" delay={1.4} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-200"
              >
                <span className="text-red-700 font-medium">
                  Publisher Receives
                </span>
                <span className="text-xl font-bold text-red-600">$0.50</span>
              </motion.div>
            </div>
          </div>

          {/* Our Solution - Right Side */}
          <div className="relative p-8 bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-2xl border-2 border-emerald-200 shadow-xl">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
              Our Web3 Solution
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Advertiser Pays
                </span>
                <span className="text-lg font-bold text-gray-900">$1.00</span>
              </div>

              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex justify-center"
              >
                <div className="w-1 h-24 bg-gradient-to-b from-indigo-400 to-emerald-400 rounded-full" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="flex items-center justify-between p-3 bg-white/70 rounded-lg"
              >
                <span className="text-gray-600 font-medium">
                  Platform Fee (5%)
                </span>
                <span className="text-lg font-medium text-gray-500">
                  -$0.05
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8 }}
                className="flex items-center justify-between p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300"
              >
                <span className="text-emerald-700 font-medium">
                  Publisher Receives
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  $0.95
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="flex items-center justify-center gap-2 text-emerald-600 font-medium"
              >
                <span className="text-3xl">↑</span>
                <span>90% more revenue</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function MiddlemanStep({
  label,
  fee,
  delay,
}: {
  label: string;
  fee: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-400 rounded-full" />
        <span className="text-gray-600">{label}</span>
      </div>
      <span className="text-red-500 font-medium">{fee}</span>
    </motion.div>
  );
}
