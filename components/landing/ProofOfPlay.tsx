"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, AlertOctagon, Lock, CheckCircle2 } from "lucide-react";

const codeSnippet = `function verifyProofOfPlay(
  bytes32 interactionHash,
  bytes memory signature
) public returns (bool) {
  // Recover signer from interaction hash
  address signer = ECDSA.recover(
    interactionHash, 
    signature
  );
  
  // Verify signer is authorized browser
  require(
    authorizedBrowsers[signer], 
    "Invalid browser signature"
  );
  
  // Verify interaction hasn't been used
  require(
    !usedProofs[interactionHash], 
    "Proof already claimed"
  );
  
  // Mark proof as used
  usedProofs[interactionHash] = true;
  
  // Release payment to publisher
  _releasePayment(msg.sender);
  
  return true;
}`;

export function ProofOfPlay() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="proof-of-play"
      className="py-24 lg:py-32 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            <Shield className="w-4 h-4" />
            Innovation Spotlight
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Proof of Play
          </h2>
          <p
            className="text-xl text-indigo-200 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Cryptographic verification that ads were actually seen—not just
            loaded
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <span className="text-red-400 text-sm font-medium">
                  The Problem
                </span>
                <h3
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Traditional Exchanges: "Trust Us"
                </h3>
              </div>
            </div>

            <p className="text-indigo-200 text-lg leading-relaxed mb-6">
              Legacy platforms use probabilistic methods to <em>guess</em> if an
              ad was really viewed. Fraud costs the industry{" "}
              <strong className="text-white">billions annually</strong>.
            </p>

            <div className="space-y-3">
              <ProblemItem text="Sample-based verification misses most fraud" />
              <ProblemItem text="No way to prove individual impressions" />
              <ProblemItem text="Advertisers pay for bot traffic" />
              <ProblemItem text="Publishers blamed for fraud they didn't commit" />
            </div>
          </motion.div>

          {/* Our Solution */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-emerald-400 text-sm font-medium">
                  Our Solution
                </span>
                <h3
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Cryptographic Proof
                </h3>
              </div>
            </div>

            <p className="text-indigo-200 text-lg leading-relaxed mb-6">
              Browser generates a hash of user interaction (scroll depth,
              viewport time, play duration) and signs it. Smart contract{" "}
              <strong className="text-white">
                only releases payment if signature is valid
              </strong>
              .
            </p>

            <div className="space-y-3">
              <SolutionItem text="Every impression cryptographically verified" />
              <SolutionItem text="Impossible to fake without browser access" />
              <SolutionItem text="Zero-knowledge proofs preserve privacy" />
              <SolutionItem text="Automatic, instant fraud rejection" />
            </div>
          </motion.div>
        </div>

        {/* Code Snippet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Code header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="ml-4 text-gray-400 text-sm font-mono">
                AdExchange.sol
              </span>
              <div className="ml-auto flex items-center gap-2 text-emerald-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Solidity
              </div>
            </div>

            {/* Code content */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm leading-relaxed">
                <code className="font-mono">
                  {codeSnippet.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-600 select-none w-8 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-300">
                        {highlightSolidity(line)}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
        <span className="text-red-400 text-xs">✗</span>
      </div>
      <span className="text-indigo-100">{text}</span>
    </div>
  );
}

function SolutionItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
      <span className="text-indigo-100">{text}</span>
    </div>
  );
}

function highlightSolidity(line: string): React.ReactNode {
  // Simple syntax highlighting
  const keywords = [
    "function",
    "public",
    "returns",
    "bool",
    "require",
    "return",
    "true",
    "bytes32",
    "bytes",
    "memory",
    "address",
  ];
  const types = ["bytes32", "bytes", "bool", "address"];

  let result = line;

  // Highlight comments
  if (result.includes("//")) {
    const parts = result.split("//");
    return (
      <>
        {parts[0]}
        <span className="text-gray-500">//{parts.slice(1).join("//")}</span>
      </>
    );
  }

  // Highlight strings
  if (result.includes('"')) {
    return result.split(/(\"[^\"]*\")/).map((part, i) =>
      part.startsWith('"') ? (
        <span key={i} className="text-amber-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  // Highlight keywords
  for (const keyword of keywords) {
    if (result.includes(keyword)) {
      result = result.replace(
        new RegExp(`\\b${keyword}\\b`, "g"),
        `<span class="text-purple-400">${keyword}</span>`
      );
    }
  }

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
