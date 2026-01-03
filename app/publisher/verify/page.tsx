"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  FileCode,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublisher } from "@/lib/hooks/usePublisher";
import { useDomainVerification } from "@/lib/hooks/usePublisher";
import { cn } from "@/lib/utils";

function CodeBlock({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="relative group">
        <div className="p-3 bg-zinc-950 rounded-lg font-mono text-sm break-all">
          <span className="text-[var(--neon-green)]">{value}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const { publisher } = usePublisher();
  const publisherId = publisher?.id || "";
  const { verified, verifying, error, checkVerification, verifyDomain } =
    useDomainVerification(publisherId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  const verificationToken = publisher?.verification_token || "YOUR_VERIFICATION_TOKEN";
  const domain = publisher?.domain || "example.com";

  const dnsRecord = `adexch-verification=${verificationToken}`;
  const metaTag = `<meta name="adexch-verification" content="${verificationToken}" />`;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Verification</h1>
          <p className="text-muted-foreground mt-1">
            Verify ownership of {domain} to activate your account
          </p>
        </div>
        <div className="flex items-center gap-3">
          {verified ? (
            <Badge className="bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Verification Status */}
      {verified ? (
        <Card className="bg-[var(--neon-green)]/10 border-[var(--neon-green)]/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--neon-green)]/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-[var(--neon-green)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--neon-green)]">Domain Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Your domain {domain} has been verified. Your publisher account is now active.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-200">Verification Required</h3>
                <p className="text-sm text-amber-200/80 mt-1">
                  Complete domain verification to activate your account and start serving ads.
                  Choose one of the verification methods below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Methods */}
      {!verified && (
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--neon-blue)]" />
              Verification Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dns" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dns">
                  <Globe className="h-4 w-4 mr-2" />
                  DNS Record
                </TabsTrigger>
                <TabsTrigger value="meta">
                  <FileCode className="h-4 w-4 mr-2" />
                  HTML Meta Tag
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dns" className="space-y-4 mt-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">DNS TXT Record (Recommended)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a TXT record to your domain's DNS configuration. This method is
                    preferred for verification as it's more secure.
                  </p>
                  <ol className="text-sm space-y-2 text-muted-foreground">
                    <li>1. Log in to your domain registrar or DNS provider</li>
                    <li>2. Find the DNS management section</li>
                    <li>3. Add a new TXT record with the following:</li>
                  </ol>
                </div>

                <div className="p-4 bg-zinc-950 rounded-lg space-y-3">
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-mono text-white">TXT</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Host:</span>
                    <span className="font-mono text-white">@</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">Value:</span>
                  </div>
                  <CodeBlock
                    value={dnsRecord}
                    label=""
                  />
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                    <span className="text-muted-foreground">TTL:</span>
                    <span className="font-mono text-white">3600 (or default)</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>Note:</strong> DNS changes can take anywhere from a few minutes to
                    48 hours to propagate. If verification fails immediately, wait a bit and try again.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="meta" className="space-y-4 mt-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-2">HTML Meta Tag</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a meta tag to your website's homepage. This is an alternative method
                    if you can't modify DNS records.
                  </p>
                  <ol className="text-sm space-y-2 text-muted-foreground">
                    <li>1. Access your website's HTML files</li>
                    <li>2. Find the <code className="text-[var(--neon-blue)]">&lt;head&gt;</code> section</li>
                    <li>3. Add the following meta tag:</li>
                  </ol>
                </div>

                <CodeBlock
                  value={metaTag}
                  label="Copy this meta tag:"
                />

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>Note:</strong> The meta tag must be placed on your homepage (the root
                    domain, e.g., https://{domain}/).
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Verification Token Display */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Your Verification Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              This unique token is used to verify your domain ownership.
            </p>
            <CodeBlock
              value={verificationToken}
              label="Verification Token:"
            />
          </div>

          {verified && publisher?.verified_at && (
            <div className="p-4 bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 rounded-lg">
              <p className="text-sm">
                <CheckCircle2 className="h-4 w-4 inline mr-2 text-[var(--neon-green)]" />
                Verified on {new Date(publisher.verified_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verify Button */}
      {!verified && (
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Ready to verify?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Make sure you've added the DNS record or meta tag before checking.
                </p>
              </div>
              <Button
                onClick={verifyDomain}
                disabled={verifying}
                className="bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white min-w-40"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Check Verification
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">DNS Provider Guides</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check our documentation for step-by-step guides for popular DNS providers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Verification Issues?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact support at <a href="mailto:support@adexch.io" className="text-[var(--neon-blue)] hover:underline">support@adexch.io</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
