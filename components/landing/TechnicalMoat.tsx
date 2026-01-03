"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  TrendingDown,
  Database,
  Clock,
  Zap,
  Shield,
  Coins,
} from "lucide-react";

export function TechnicalMoat() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="technical-moat"
      className="py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-orange-50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Competitive Advantage
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Why Google <span className="text-orange-500">Can't</span> Copy This
          </h2>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Our advantages aren't just technical—they're structural. Here's why
            the giants can't follow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Revenue Cannibalization Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>

            <h3
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Revenue Cannibalization
            </h3>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Google makes{" "}
              <strong className="text-gray-900">billions from 30% fees</strong>.
              Moving to 1% would tank their stock price. They're structurally
              incapable of competing on price.
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-500">$50B+</div>
                <div className="text-sm text-gray-500">
                  Google's annual ad revenue
                </div>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">30%</div>
                <div className="text-sm text-gray-500">Average take rate</div>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure Debt Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
              <Database className="w-8 h-8 text-white" />
            </div>

            <h3
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Infrastructure Debt
            </h3>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Legacy exchanges built on{" "}
              <strong className="text-gray-900">SQL + centralized APIs</strong>.
              Rebuilding for Pub-Sub + blockchain would take years and billions
              in engineering.
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <div className="text-3xl font-bold text-indigo-500">20+</div>
                <div className="text-sm text-gray-500">
                  Years of legacy code
                </div>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">1000s</div>
                <div className="text-sm text-gray-500">Engineers needed</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional moat points */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <MoatPoint
            icon={<Clock className="w-5 h-5" />}
            title="First Mover"
            description="18-month head start on Web3 ad infrastructure"
          />
          <MoatPoint
            icon={<Zap className="w-5 h-5" />}
            title="Network Effects"
            description="Each publisher addition increases value for advertisers"
          />
          <MoatPoint
            icon={<Coins className="w-5 h-5" />}
            title="Token Economics"
            description="Aligned incentives through staking and governance"
          />
        </motion.div>
      </div>
    </section>
  );
}

function MoatPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
