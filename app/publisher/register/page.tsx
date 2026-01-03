"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  "Technology", "Business", "Finance", "Health", "Education",
  "Entertainment", "Gaming", "Sports", "News", "Lifestyle",
  "Travel", "Food & Drink", "Art & Design", "Science", "Other"
];

export default function PublisherRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    domain: "",
    email: "",
    wallet_address: "",
    website_category: "",
    monthly_pageviews: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }
    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required";
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = "Please enter a valid domain (e.g., example.com)";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.wallet_address.trim()) {
      newErrors.wallet_address = "Wallet address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.wallet_address)) {
      newErrors.wallet_address = "Please enter a valid Ethereum address";
    }
    if (!formData.website_category) {
      newErrors.website_category = "Please select a category";
    }
    if (!formData.monthly_pageviews || parseInt(formData.monthly_pageviews) < 0) {
      newErrors.monthly_pageviews = "Please enter valid pageviews";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/publisher/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthly_pageviews: parseInt(formData.monthly_pageviews),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setStep("success");
      } else {
        setErrors({ form: data.error || "Registration failed" });
      }
    } catch (err) {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <Card className="w-full max-lg relative z-10 bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--neon-blue)]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[var(--neon-blue)]" />
            </div>
            <CardTitle className="text-2xl">Account Created!</CardTitle>
            <CardDescription>
              Your publisher account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{result.publisher.company_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Domain:</span>
                <span className="font-medium">{result.publisher.domain}</span>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Your API Key (save this now):</p>
                <code className="text-xs bg-background px-3 py-2 rounded block break-all text-[var(--neon-blue)]">
                  {result.publisher.api_key}
                </code>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Verification Token:</p>
                <code className="text-xs bg-background px-3 py-2 rounded block break-all text-[var(--neon-blue)]">
                  {result.publisher.verification_token}
                </code>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-200">
                <strong>Next Step:</strong> Verify your domain ownership to activate your account.
                Visit the Verification page after logging in.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("form")}
              >
                Register Another
              </Button>
              <Button
                className="flex-1 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white"
                onClick={() => router.push("/publisher/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <Card className="w-full max-lg relative z-10 bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-[var(--neon-blue)]" />
            <span className="text-2xl font-bold tracking-wider">
              AD<span className="text-[var(--neon-blue)]">EXCH</span>
            </span>
          </div>
          <CardTitle className="text-2xl">Publisher Registration</CardTitle>
          <CardDescription>
            Create your publisher account and start monetizing your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                {errors.form}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="My Publishing Company"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className={cn(errors.company_name && "border-red-500")}
              />
              {errors.company_name && (
                <p className="text-xs text-red-400">{errors.company_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className={cn(errors.domain && "border-red-500")}
              />
              {errors.domain && (
                <p className="text-xs text-red-400">{errors.domain}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="publisher@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet_address">Wallet Address *</Label>
              <Input
                id="wallet_address"
                placeholder="0x..."
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                className={cn(errors.wallet_address && "border-red-500")}
                fontFamily="mono"
              />
              {errors.wallet_address && (
                <p className="text-xs text-red-400">{errors.wallet_address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website_category">Category *</Label>
                <select
                  id="website_category"
                  value={formData.website_category}
                  onChange={(e) => setFormData({ ...formData, website_category: e.target.value })}
                  className={cn(
                    "w-full h-10 px-3 rounded-md bg-background border border-input",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)]",
                    errors.website_category && "border-red-500"
                  )}
                >
                  <option value="">Select...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.website_category && (
                  <p className="text-xs text-red-400">{errors.website_category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_pageviews">Monthly Pageviews *</Label>
                <Input
                  id="monthly_pageviews"
                  type="number"
                  placeholder="100000"
                  value={formData.monthly_pageviews}
                  onChange={(e) => setFormData({ ...formData, monthly_pageviews: e.target.value })}
                  className={cn(errors.monthly_pageviews && "border-red-500")}
                />
                {errors.monthly_pageviews && (
                  <p className="text-xs text-red-400">{errors.monthly_pageviews}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Publisher Account"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
