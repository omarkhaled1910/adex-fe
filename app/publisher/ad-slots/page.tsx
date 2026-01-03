"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Layout,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Eye,
  MousePointerClick,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdSlots } from "@/lib/hooks/usePublisher";
import { formatCurrency, cn } from "@/lib/utils";
import type { AdSlot, SlotStatus } from "@/lib/types/publisher";

const slotTypeIcons: Record<string, string> = {
  banner: "B",
  video: "V",
  native: "N",
  interstitial: "I",
};

const slotTypeColors: Record<string, string> = {
  banner: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
  video:
    "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
  native: "from-green-500/20 to-green-500/5 border-green-500/30 text-green-400",
  interstitial:
    "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400",
};

function AdSlotCard({
  slot,
  onStatusToggle,
  onEdit,
}: {
  slot: AdSlot;
  onStatusToggle: (slot: AdSlot) => void;
  onEdit: (slot: AdSlot) => void;
}) {
  const ctr =
    slot.impressions_served > 0
      ? ((slot.clicks / slot.impressions_served) * 100).toFixed(2)
      : "0.00";

  const rpm =
    slot.impressions_served > 0
      ? ((slot.total_revenue / slot.impressions_served) * 1000).toFixed(2)
      : "0.00";

  return (
    <Card
      className={cn(
        "bg-gradient-to-br overflow-hidden group hover:shadow-lg hover:shadow-[var(--neon-blue)]/10 transition-all",
        slotTypeColors[slot.slot_type]
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                slot.slot_type === "banner" && "bg-blue-500/20 text-blue-400",
                slot.slot_type === "video" &&
                  "bg-purple-500/20 text-purple-400",
                slot.slot_type === "native" && "bg-green-500/20 text-green-400",
                slot.slot_type === "interstitial" &&
                  "bg-amber-500/20 text-amber-400"
              )}
            >
              {slotTypeIcons[slot.slot_type]}
            </div>
            <div>
              <CardTitle className="text-lg">{slot.slot_name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {slot.slot_type} • {slot.width}×{slot.height}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={slot.status === "active" ? "default" : "secondary"}
              className={cn(
                slot.status === "active"
                  ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {slot.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(slot)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Floor Price
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusToggle(slot)}>
                  {slot.status === "active" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Slot
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate Slot
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Impressions</p>
              <p className="font-medium">
                {slot.impressions_served.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Clicks</p>
              <p className="font-medium">{slot.clicks.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-medium">
                {formatCurrency(slot.total_revenue)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">CTR / RPM</p>
              <p className="font-medium">
                {ctr}% / ${rpm}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Floor Price:</span>
          <span className="font-medium">
            {formatCurrency(slot.floor_price)}/CPM
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EditFloorPriceModal({
  slot,
  open,
  onClose,
  onSave,
}: {
  slot: AdSlot | null;
  open: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
}) {
  const [price, setPrice] = useState(slot?.floor_price?.toString() || "0.01");

  useEffect(() => {
    if (slot) setPrice(slot.floor_price?.toString() || "0.01");
  }, [slot]);

  if (!open || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-md bg-card border-border/50">
        <CardHeader>
          <CardTitle>Edit Floor Price</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the minimum CPM price for {slot.slot_name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Floor Price (USD/CPM)</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 pl-7 pr-3 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white"
              onClick={() => {
                const newPrice = parseFloat(price);
                if (newPrice >= 0.01) {
                  onSave(newPrice);
                  onClose();
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdSlotsPage() {
  const { adSlots, loading, updateAdSlot, refetch } = useAdSlots();
  const [filter, setFilter] = useState<SlotStatus | "all">("all");
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredSlots =
    filter === "all" ? adSlots : adSlots.filter((s) => s.status === filter);

  const handleStatusToggle = async (slot: AdSlot) => {
    const newStatus: SlotStatus =
      slot.status === "active" ? "paused" : "active";
    await updateAdSlot(slot.id, { status: newStatus });
    refetch();
  };

  const handleEdit = (slot: AdSlot) => {
    setEditingSlot(slot);
    setShowEditModal(true);
  };

  const handleSaveFloorPrice = async (price: number) => {
    if (editingSlot) {
      await updateAdSlot(editingSlot.id, { floor_price: price });
      refetch();
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Slots</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ad placements and inventory
          </p>
        </div>
        <Link href="/publisher/ad-slots/new">
          <Button className="bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Ad Slot
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--neon-blue)]/20 flex items-center justify-center">
                <Layout className="h-5 w-5 text-[var(--neon-blue)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Slots</p>
                <p className="text-xl font-bold">{adSlots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--neon-green)]/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-[var(--neon-green)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Impressions
                </p>
                <p className="text-xl font-bold">
                  {adSlots
                    .reduce((sum, s) => sum + s.impressions_served, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--neon-purple)]/20 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-[var(--neon-purple)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-xl font-bold">
                  {adSlots
                    .reduce((sum, s) => sum + s.clicks, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    adSlots.reduce((sum, s) => sum + s.total_revenue, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        <Select
          value={filter}
          onValueChange={(v: SlotStatus | "all") => setFilter(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Slots</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ad Slots Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : filteredSlots.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredSlots.map((slot) => (
            <AdSlotCard
              key={slot.id}
              slot={slot}
              onStatusToggle={handleStatusToggle}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="py-12 text-center">
            <Layout className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">
              {filter === "all" ? "No ad slots yet" : `No ${filter} ad slots`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === "all"
                ? "Create your first ad slot to start monetizing your content."
                : "Try changing the filter to see more slots."}
            </p>
            {filter === "all" && (
              <Link href="/publisher/ad-slots/new">
                <Button className="bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad Slot
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <EditFloorPriceModal
        slot={editingSlot}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveFloorPrice}
      />
    </div>
  );
}
