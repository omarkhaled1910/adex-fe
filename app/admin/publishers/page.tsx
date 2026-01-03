"use client";

import { useEffect, useState } from "react";
import { Search, Globe, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
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

interface Publisher {
  id: string;
  domain: string;
  company_name: string;
  email: string;
  status: string;
  tier: string;
  total_earnings: number;
  pending_earnings: number;
  withdrawn_earnings: number;
  domain_verified: boolean;
  website_category: string | null;
  monthly_pageviews: number | null;
  auction_count: number;
  total_revenue_generated: number;
  avg_auction_duration: number | null;
  created_at: Date;
}

interface PublisherStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  verified: number;
  totalEarnings: number;
}

export default function PublishersDashboard() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [stats, setStats] = useState<PublisherStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/admin/publishers?status=${statusFilter}&limit=100`
      );

      if (res.ok) {
        const data = await res.json();
        setPublishers(data.publishers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching publishers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const filteredPublishers = publishers.filter((p) =>
    p.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Globe className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading publishers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Publishers Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all publishers
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
              <CardTitle className="text-xs font-medium text-red-500">
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.suspended}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(stats.totalEarnings)}
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
            placeholder="Search by domain or company name..."
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

      {/* Publishers Table */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Publishers</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPublishers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No publishers match your filters."
                : "No publishers found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Auctions</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublishers.map((publisher) => (
                    <TableRow key={publisher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{publisher.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>{publisher.company_name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            publisher.status === "active" &&
                              "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
                            publisher.status === "pending" &&
                              "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30",
                            publisher.status === "suspended" &&
                              "bg-red-500/20 text-red-500 border-red-500/30"
                          )}
                        >
                          {publisher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{publisher.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        {publisher.domain_verified ? (
                          <CheckCircle className="h-4 w-4 text-[var(--neon-green)]" />
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>{publisher.auction_count || 0}</TableCell>
                      <TableCell>{formatCurrency(publisher.total_earnings)}</TableCell>
                      <TableCell>
                        <span className="text-[var(--neon-orange)]">
                          {formatCurrency(publisher.pending_earnings)}
                        </span>
                      </TableCell>
                      <TableCell>{publisher.website_category || "-"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(publisher.created_at).toLocaleDateString()}
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
