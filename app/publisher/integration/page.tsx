"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Code,
  FileCode,
  Globe,
  Layout,
  Video,
  FileText,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublisher } from "@/lib/hooks/usePublisher";
import { cn } from "@/lib/utils";

function CodeBlock({
  code,
  language = "html",
  copyable = true,
}: {
  code: string;
  language?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={cn(
          "font-mono",
          language === "html" && "text-orange-300",
          language === "javascript" && "text-yellow-300"
        )}>
          {code}
        </code>
      </pre>
      {copyable && (
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
      )}
    </div>
  );
}

function IntegrationStep({
  num,
  title,
  description,
  children,
}: {
  num: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--neon-blue)]/20 border border-[var(--neon-blue)]/50 flex items-center justify-center text-[var(--neon-blue)] font-bold text-sm">
        {num}
      </div>
      <div className="flex-1 pb-8">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

export default function IntegrationPage() {
  const { publisher } = usePublisher();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  const publisherId = publisher?.id || "YOUR_PUBLISHER_ID";
  const apiKey = publisher?.api_key || "YOUR_API_KEY";

  const baseScript = `<script
  src="https://cdn.adexchange.com/sdk.js"
  data-publisher-id="${publisherId}"
  data-api-key="${apiKey}"
  async>
</script>`;

  const bannerSlot = `<!-- Banner Ad Slot -->
<div data-slot-id="YOUR_SLOT_UUID" class="adexch-ad-slot"></div>`;

  const videoSlot = `<!-- Video Ad Slot -->
<div data-slot-id="YOUR_SLOT_UUID"
     data-ad-type="video"
     class="adexch-ad-slot">
</div>`;

  const nativeSlot = `<!-- Native Ad Slot -->
<div data-slot-id="YOUR_SLOT_UUID"
     data-ad-type="native"
     class="adexch-ad-slot">
  <!-- Fallback content -->
</div>`;

  const fullExample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Site - Ads Integration</title>
  <style>
    .adexch-ad-slot {
      min-height: 90px;
    }
    .adexch-ad-slot[data-ad-type="video"] {
      min-height: 360px;
    }
  </style>
</head>
<body>
  <!-- Your content -->
  <h1>Welcome to My Site</h1>
  <p>Amazing content here...</p>

  <!-- AD EXCHANGE SDK -->
  ${baseScript.replace(/`/g, "\\`")}

  <!-- Banner Ad Slot -->
  ${bannerSlot.replace(/`/g, "\\`")}

  <!-- More content -->
</body>
</html>`;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration Guide</h1>
        <p className="text-muted-foreground mt-1">
          Add the AdExchange SDK to your website and start serving ads
        </p>
      </div>

      {/* Publisher Credentials */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--neon-blue)]" />
            Your Publisher Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Publisher ID</p>
            <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-lg font-mono text-sm">
              <span className="text-[var(--neon-blue)]">{publisherId}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">API Key</p>
            <div className="flex items-center gap-2 p-3 bg-zinc-950 rounded-lg font-mono text-sm">
              <span className="text-[var(--neon-green)] break-all">{apiKey}</span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto flex-shrink-0"
                onClick={() => navigator.clipboard.writeText(apiKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-amber-400 mt-2">
              <HelpCircle className="h-3 w-3 inline mr-1" />
              Keep your API key secret. Never expose it in client-side code.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Steps */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Quick Start Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <IntegrationStep
              num={1}
              title="Add the SDK Script"
              description="Place this script tag in the <head> section of your website, before the closing </head> tag."
            >
              <CodeBlock code={baseScript} />
            </IntegrationStep>

            <IntegrationStep
              num={2}
              title="Add Ad Slots to Your Page"
              description="Place ad slot divs where you want ads to appear on your page."
            >
              <Tabs defaultValue="banner" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="banner">
                    <Layout className="h-4 w-4 mr-2" />
                    Banner
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="native">
                    <FileText className="h-4 w-4 mr-2" />
                    Native
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="banner">
                  <p className="text-sm text-muted-foreground mb-3">
                    Standard banner ads (728x90, 300x250, etc.)
                  </p>
                  <CodeBlock code={bannerSlot} />
                </TabsContent>
                <TabsContent value="video">
                  <p className="text-sm text-muted-foreground mb-3">
                    Video ads for in-stream placements
                  </p>
                  <CodeBlock code={videoSlot} />
                </TabsContent>
                <TabsContent value="native">
                  <p className="text-sm text-muted-foreground mb-3">
                    Native ads that blend with your content
                  </p>
                  <CodeBlock code={nativeSlot} />
                </TabsContent>
              </Tabs>
            </IntegrationStep>

            <IntegrationStep
              num={3}
              title="Test Your Integration"
              description="Load your page and check if ads appear. Use browser DevTools to verify SDK is loaded."
            >
              <div className="p-4 bg-zinc-950 rounded-lg space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Open browser DevTools (F12) → Console and run:
                </p>
                <code className="text-[var(--neon-green)]">
                  console.log(window.AdExchange);
                </code>
                <p className="text-muted-foreground mt-2">
                  You should see the AdExchange SDK object logged.
                </p>
              </div>
            </IntegrationStep>
          </div>
        </CardContent>
      </Card>

      {/* Full Example */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Complete Example</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Here's a complete HTML page with the AdExchange SDK integrated:
          </p>
          <CodeBlock code={fullExample} />
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <h4 className="font-medium mb-1">Ads not showing?</h4>
              <p className="text-sm text-muted-foreground">
                Check that your domain is verified and your ad slots have status "active".
                Make sure the slot ID matches your created ad slot UUID.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <h4 className="font-medium mb-1">Console errors?</h4>
              <p className="text-sm text-muted-foreground">
                Ensure the SDK script loads before your ad slot divs. Check for CORS issues
                if loading from a different domain.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <h4 className="font-medium mb-1">Low fill rate?</h4>
              <p className="text-sm text-muted-foreground">
                Consider lowering your floor price or creating more ad slots in different
                placements to increase inventory.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <h4 className="font-medium mb-1">Need help?</h4>
              <p className="text-sm text-muted-foreground">
                Contact our support team at <a href="mailto:support@adexch.io" className="text-[var(--neon-blue)] hover:underline">support@adexch.io</a> or
                check our documentation at <a href="#" className="text-[var(--neon-blue)] hover:underline">docs.adexch.io</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
