"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Monitor,
  Radio,
  FileCode,
  Wallet,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Browser",
    subtitle: "Ad Impression",
    icon: Monitor,
    color: "from-blue-400 to-blue-600",
    description: "User views ad on publisher site",
  },
  {
    id: 2,
    title: "RabbitMQ",
    subtitle: "Auction Engine",
    icon: Radio,
    color: "from-orange-400 to-orange-600",
    highlight: "Millisecond bidding",
    description: "Real-time auction across all bidders",
  },
  {
    id: 3,
    title: "Smart Contract",
    subtitle: "Settlement Layer",
    icon: FileCode,
    color: "from-indigo-400 to-indigo-600",
    highlight: "Instant payout",
    description: "Trustless, automated payments",
  },
  {
    id: 4,
    title: "Publisher Wallet",
    subtitle: "Receives Funds",
    icon: Wallet,
    color: "from-emerald-400 to-emerald-600",
    description: "Funds arrive in real-time",
  },
];

export function Architecture() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="demo"
      className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Technical Architecture
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            How It Works
          </h2>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            From impression to payment in under a second
          </p>
        </motion.div>

        {/* Desktop Flow */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="flex items-center"
              >
                <ArchitectureCard
                  step={step}
                  isLast={index === steps.length - 1}
                />

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                    className="mx-4"
                  >
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <MobileArchitectureCard step={step} />

              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Timing Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <TimingStat
            label="Auction Time"
            value="<50ms"
            icon={<Clock className="w-5 h-5" />}
          />
          <TimingStat
            label="Settlement"
            value="<1s"
            icon={<Zap className="w-5 h-5" />}
          />
          <TimingStat
            label="Throughput"
            value="10K/s"
            icon={<Radio className="w-5 h-5" />}
          />
          <TimingStat
            label="Uptime"
            value="99.99%"
            icon={<Monitor className="w-5 h-5" />}
          />
        </motion.div>
      </div>
    </section>
  );
}

function ArchitectureCard({
  step,
  isLast,
}: {
  step: (typeof steps)[0];
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <div
      className={`relative w-56 bg-white rounded-2xl p-6 shadow-lg border-2 ${
        isLast ? "border-emerald-200" : "border-gray-100"
      } hover:shadow-xl transition-shadow`}
    >
      {step.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full whitespace-nowrap">
          {step.highlight}
        </div>
      )}

      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      <div className="text-sm text-gray-500 mb-1">{step.subtitle}</div>
      <h3
        className="text-lg font-bold text-gray-900 mb-2"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {step.title}
      </h3>
      <p className="text-sm text-gray-600">{step.description}</p>
    </div>
  );
}

function MobileArchitectureCard({ step }: { step: (typeof steps)[0] }) {
  const Icon = step.icon;

  return (
    <div className="relative bg-white rounded-xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            {step.highlight && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {step.highlight}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-1">{step.subtitle}</div>
          <p className="text-sm text-gray-600">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

function TimingStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-5 text-center shadow-lg border border-gray-100">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mx-auto mb-3 text-indigo-600">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
