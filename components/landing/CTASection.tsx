"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Calendar, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section
      id="cta"
      className="py-24 lg:py-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Ready to Cut Out the Middlemen?
          </h2>
          <p
            className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Join the publishers and advertisers already saving millions with
            blockchain-powered ad tech.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Email Signup */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Request Early Access
                </h3>
                <p className="text-indigo-200 text-sm">
                  Be first in line when we launch
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30"
              >
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-white font-medium">You're on the list!</p>
                  <p className="text-emerald-200 text-sm">
                    We'll be in touch soon.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    data-analytics="cta-email-input"
                  />
                  {error && (
                    <p className="mt-2 text-red-300 text-sm">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-analytics="cta-submit-email"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get Early Access
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Book Demo */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Book a Demo
                </h3>
                <p className="text-indigo-200 text-sm">
                  See the platform in action
                </p>
              </div>
            </div>

            <p className="text-indigo-100 mb-6">
              Get a personalized walkthrough of our platform. See real-time
              auctions, smart contract settlements, and our analytics dashboard.
            </p>

            <div className="space-y-3 mb-6">
              <DemoFeature text="30-minute live demo" />
              <DemoFeature text="Technical deep-dive available" />
              <DemoFeature text="Custom integration discussion" />
            </div>

            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
              data-analytics="cta-book-demo"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Call
            </a>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-indigo-300 text-sm mb-4">
            Trusted by forward-thinking publishers
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            {/* Placeholder for partner logos */}
            <div className="w-24 h-8 bg-white/20 rounded" />
            <div className="w-24 h-8 bg-white/20 rounded" />
            <div className="w-24 h-8 bg-white/20 rounded" />
            <div className="w-24 h-8 bg-white/20 rounded hidden sm:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DemoFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-indigo-100">
      <CheckCircle className="w-4 h-4 text-emerald-400" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
