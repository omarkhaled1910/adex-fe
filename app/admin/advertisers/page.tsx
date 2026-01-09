"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Users, DollarSign, Wallet, CheckCircle, Clock, Grid3X3, List } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/admin/Pagination";
import { RefreshControl } from "@/components/admin/RefreshControl";
import {
  useAdvertisers,
  type Advertiser,
} from "@/lib/hooks/use-admin-data";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AdvertisersDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const refetchIntervalMs = refreshInterval > 0 ? refreshInterval * 1000 : false;

  const { data, isLoading, isError, error } = useAdvertisers(
    statusFilter,
    currentPage,
    ITEMS_PER_PAGE,
    refetchIntervalMs
  );

  const stats = data?.stats;
  const advertisers = data?.advertisers || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Client-side search filter
  const filteredAdvertisers = advertisers.filter((a) =>
    a.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayAdvertisers = searchTerm ? filteredAdvertisers : advertisers;

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading advertisers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading advertisers</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Advertisers Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all advertisers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshControl
            defaultInterval={10}
            onRefresh={async () => {
              await queryClient.invalidateQueries({ queryKey: ["admin", "advertisers"] });
            }}
            onIntervalChange={setRefreshInterval}
          />
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[var(--neon-purple)]" : ""}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-[var(--neon-purple)]" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-[var(--neon-green)]">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-green)]">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-[var(--neon-orange)]">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-orange)]">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                KYC Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.kycApproved}</div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Total Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(stats.totalSpend)}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(stats.totalBalances)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by wallet or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advertisers Grid/Table */}
      {displayAdvertisers.length === 0 ? (
        <Card className="card-glow">
          <CardContent className="text-center py-12 text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No advertisers match your filters."
              : "No advertisers found."}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Advertisers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayAdvertisers.map((advertiser) => (
                <AdvertiserCard key={advertiser.id} advertiser={advertiser} />
              ))}
            </div>
            {!searchTerm && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Advertisers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Avg CPM</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayAdvertisers.map((advertiser) => (
                    <TableRow key={advertiser.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {shortenAddress(advertiser.wallet_address)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{advertiser.company_name || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={advertiser.status} />
                      </TableCell>
                      <TableCell>
                        <KycBadge kycStatus={advertiser.kyc_status} />
                      </TableCell>
                      <TableCell>{advertiser.campaign_count}</TableCell>
                      <TableCell>
                        <span className="text-[var(--neon-green)]">
                          {advertiser.active_campaigns_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(advertiser.total_spent)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(advertiser.on_chain_balance)}
                      </TableCell>
                      <TableCell>
                        <span className="text-[var(--neon-orange)]">
                          {formatCurrency(advertiser.reserved_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {advertiser.total_impressions?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>
                        {advertiser.avg_cpm
                          ? `$${advertiser.avg_cpm.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(advertiser.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {!searchTerm && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Advertiser Card Component
function AdvertiserCard({ advertiser }: { advertiser: Advertiser }) {
  return (
    <Card className="card-glow hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-mono text-xs text-muted-foreground">
                {shortenAddress(advertiser.wallet_address)}
              </span>
            </div>
            <p className="font-medium truncate mt-1">
              {advertiser.company_name || "No company name"}
            </p>
          </div>
          <StatusBadge status={advertiser.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">KYC Status</span>
          <KycBadge kycStatus={advertiser.kyc_status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Campaigns</span>
          <span className="text-sm font-medium">
            {advertiser.active_campaigns_count} / {advertiser.campaign_count}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Spent</span>
          <span className="text-sm font-medium text-[var(--neon-green)]">
            {formatCurrency(advertiser.total_spent)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Balance</span>
          <span className="text-sm font-medium">
            {formatCurrency(advertiser.on_chain_balance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Reserved</span>
          <span className="text-sm font-medium text-[var(--neon-orange)]">
            {formatCurrency(advertiser.reserved_balance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Avg CPM</span>
          <span className="text-sm font-medium">
            {advertiser.avg_cpm ? `$${advertiser.avg_cpm.toFixed(2)}` : "-"}
          </span>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {advertiser.total_impressions?.toLocaleString() || "0"} impressions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "active" &&
          "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
        status === "pending" &&
          "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30",
        status === "suspended" &&
          "bg-red-500/20 text-red-500 border-red-500/30"
      )}
    >
      {status}
    </Badge>
  );
}

// KYC Badge Component
function KycBadge({ kycStatus }: { kycStatus: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        kycStatus === "approved" &&
          "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
        kycStatus === "pending" &&
          "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30"
      )}
    >
      {kycStatus === "approved" ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </>
      ) : kycStatus === "pending" ? (
        <>
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </>
      ) : (
        kycStatus
      )}
    </Badge>
  );
}
