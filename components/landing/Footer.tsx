"use client";

import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { label: "How It Works", href: "#demo" },
    { label: "Pricing", href: "#competitive-landscape" },
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                AdExchange
              </span>
            </a>
            <p
              className="text-sm mb-6"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              The future of programmatic advertising. Transparent, instant, and
              fair.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-sm"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            © {currentYear} AdExchange. All rights reserved.
          </p>
          <p
            className="text-sm"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Built with blockchain technology for complete transparency.
          </p>
        </div>
      </div>
    </footer>
  );
}
