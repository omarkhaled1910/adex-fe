"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "#problem", label: "The Problem" },
  { href: "#competitive-landscape", label: "Compare" },
  { href: "#proof-of-play", label: "Technology" },
  { href: "#demo", label: "How It Works" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isScrolled
                    ? "bg-indigo-600"
                    : "bg-white/20 backdrop-blur-sm border border-white/30"
                }`}
              >
                <Zap
                  className={`w-6 h-6 ${
                    isScrolled ? "text-white" : "text-indigo-600"
                  }`}
                />
              </div>
              <span
                className={`text-xl font-bold transition-colors ${
                  isScrolled ? "text-gray-900" : "text-gray-900"
                }`}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                AdExchange
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                    isScrolled ? "text-gray-700" : "text-gray-700"
                  }`}
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="#cta"
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Sign In
              </a>
              <a
                href="#cta"
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute top-16 left-0 right-0 bg-white shadow-xl">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <a
                    href="#cta"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 font-medium"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Sign In
                  </a>
                  <a
                    href="#cta"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
