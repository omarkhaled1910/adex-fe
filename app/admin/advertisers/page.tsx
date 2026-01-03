"use client";

import { useEffect, useState } from "react";
import { Search, Users, DollarSign, Wallet, CheckCircle, Clock } from "lucide-react";
import { RefreshControl } from "@/components/admin/RefreshControl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

interface Advertiser {
  id: string;
  wallet_address: string;
  company_name: string;
  email: string;
  status: string;
  on_chain_balance: number;
  reserved_balance: number;
  total_spent: number;
  kyc_status: string;
  campaign_count: number;
  active_campaigns_count: number;
  campaign_spend: number;
  total_impressions: number;
  avg_cpm: number;
  avg_cpc: number;
  created_at: Date;
}

interface AdvertiserStats {
  total: number;
  active: number;
  pending: number;
  kycApproved: number;
  kycPending: number;
  totalSpend: number;
  totalBalances: number;
}

export default function AdvertisersDashboard() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [stats, setStats] = useState<AdvertiserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/admin/advertisers?status=${statusFilter}&limit=100`
      );

      if (res.ok) {
        const data = await res.json();
        setAdvertisers(data.advertisers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching advertisers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const filteredAdvertisers = advertisers.filter((a) =>
    a.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading advertisers...</p>
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
        <RefreshControl
          onRefresh={fetchData}
          defaultInterval={10}
          isRefreshing={refreshing}
        />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Advertisers Table */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Advertisers</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAdvertisers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No advertisers match your filters."
                : "No advertisers found."}
            </div>
          ) : (
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
                  {filteredAdvertisers.map((advertiser) => (
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
                        <Badge
                          variant="outline"
                          className={cn(
                            advertiser.status === "active" &&
                              "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
                            advertiser.status === "pending" &&
                              "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30",
                            advertiser.status === "suspended" &&
                              "bg-red-500/20 text-red-500 border-red-500/30"
                          )}
                        >
                          {advertiser.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            advertiser.kyc_status === "approved" &&
                              "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
                            advertiser.kyc_status === "pending" &&
                              "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30"
                          )}
                        >
                          {advertiser.kyc_status === "approved" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </>
                          ) : advertiser.kyc_status === "pending" ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          ) : (
                            advertiser.kyc_status
                          )}
                        </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
