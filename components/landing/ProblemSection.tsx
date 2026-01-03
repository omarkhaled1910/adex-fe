"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, TrendingDown, Clock, Eye } from "lucide-react";

const feeBreakdown = [
  { label: "DSP Fee", amount: 0.15, color: "bg-red-400" },
  { label: "Exchange Fee", amount: 0.1, color: "bg-red-500" },
  { label: "SSP Fee", amount: 0.15, color: "bg-red-600" },
  { label: "Fraud Verification", amount: 0.05, color: "bg-red-700" },
  { label: "Ad Server", amount: 0.05, color: "bg-red-800" },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
      className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-50 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Hidden Cost
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            The <span className="text-red-600">$0.50</span> Problem
          </h2>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            For every dollar advertisers spend, publishers only see half. The
            rest disappears into a maze of middlemen.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Money Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
          >
            <h3
              className="text-xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Where Your Ad Dollar Goes
            </h3>

            {/* Starting amount */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg mb-4">
              <span className="font-semibold text-indigo-900">
                Advertiser Pays
              </span>
              <span className="text-2xl font-bold text-indigo-600">$1.00</span>
            </div>

            {/* Fee breakdown with animated bars */}
            <div className="space-y-3 mb-4">
              {feeBreakdown.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, width: 0 }}
                  animate={isInView ? { opacity: 1, width: "100%" } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-red-600 font-semibold w-16 text-right">
                    -${item.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4" />

            {/* Final amount */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200"
            >
              <span className="font-semibold text-red-900">
                Publisher Receives
              </span>
              <span className="text-3xl font-bold text-red-600">$0.50</span>
            </motion.div>

            {/* Loss percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.1 }}
              className="mt-4 text-center text-gray-500 flex items-center justify-center gap-2"
            >
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span>50% lost to intermediaries</span>
            </motion.div>
          </motion.div>

          {/* Our Solution Callout */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
              <h3
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Our Solution
              </h3>
              <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg mb-4">
                <span className="font-medium">Publisher Receives</span>
                <span className="text-4xl font-bold">$0.95</span>
              </div>
              <p className="text-emerald-100 text-lg">
                A single 5% platform fee. No DSPs, SSPs, or hidden charges. Just
                transparent, instant settlement on the blockchain.
              </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center"
              >
                <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  0 Days
                </div>
                <div className="text-gray-600 text-sm">Payment Delay</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center"
              >
                <Eye className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  100%
                </div>
                <div className="text-gray-600 text-sm">Transparency</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
