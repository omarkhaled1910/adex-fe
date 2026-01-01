"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCreatives, useDeleteCreative } from "@/lib/hooks/useCreatives";
import { useToast } from "@/hooks/use-toast";

export default function CreativesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // React Query hooks
  const { data: creatives = [], isLoading, error, refetch } = useCreatives();
  const deleteMutation = useDeleteCreative();

  const filteredCreatives = creatives.filter(
    (creative) =>
      creative.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creative.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getReviewStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-[var(--neon-green)]" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "banner":
        return "bg-blue-500/20 text-blue-400";
      case "video":
        return "bg-purple-500/20 text-purple-400";
      case "native":
        return "bg-green-500/20 text-green-400";
      case "interstitial":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleDelete = async (creativeId: string, creativeName: string) => {
    if (!confirm(`Are you sure you want to delete "${creativeName}"?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(creativeId);
      toast({
        title: "Creative Deleted",
        description: `"${creativeName}" has been deleted.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete creative",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Creatives</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ad creatives and assets
          </p>
        </div>
        <Link href="/advertiser/creatives/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Creative
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-500 font-medium">
                Failed to load creatives
              </p>
              <p className="text-sm text-muted-foreground">
                {(error as Error).message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Creatives Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--neon-green)]" />
        </div>
      ) : filteredCreatives.length === 0 ? (
        <Card className="card-glow">
          <CardContent className="py-12">
            <div className="text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No creatives match your search"
                  : "No creatives yet. Create your first ad creative."}
              </p>
              {!searchQuery && (
                <Link href="/advertiser/creatives/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Creative
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id} className="card-glow overflow-hidden">
              {/* Preview Area */}
              <div className="aspect-video bg-gradient-to-br from-secondary/50 to-secondary flex items-center justify-center border-b border-border/50">
                <div className="text-center p-4">
                  <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {creative.width} × {creative.height}
                  </p>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/advertiser/creatives/${creative.id}/edit`}
                      className="font-semibold truncate block hover:text-[var(--neon-green)] transition-colors"
                    >
                      {creative.name || creative.headline || "Untitled"}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {creative.campaign_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getReviewStatusIcon(creative.review_status)}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getFormatColor(creative.format)}>
                    {creative.format}
                  </Badge>
                  <Badge
                    variant={
                      creative.status === "active" ? "default" : "secondary"
                    }
                    className={
                      creative.status === "active"
                        ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                        : ""
                    }
                  >
                    {creative.status}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-border/50">
                  <div>
                    <p className="text-muted-foreground text-xs">Impr</p>
                    <p className="font-mono">
                      {creative.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Clicks</p>
                    <p className="font-mono">
                      {creative.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">CTR</p>
                    <p className="font-mono">
                      {creative.ctr
                        ? `${(creative.ctr * 100).toFixed(2)}%`
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/advertiser/creatives/${creative.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-[var(--neon-green)]/30 hover:border-[var(--neon-green)] hover:bg-[var(--neon-green)]/10"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/30 hover:border-red-500"
                    onClick={() =>
                      handleDelete(
                        creative.id,
                        creative.name || creative.headline || "Creative"
                      )
                    }
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
