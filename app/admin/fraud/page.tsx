"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Shield,
  Search,
  CheckCircle,
  Eye,
  X,
} from "lucide-react";
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
import { cn, shortenAddress } from "@/lib/utils";

interface FraudIncident {
  id: string;
  fraudType: string;
  confidenceScore: number;
  status: string;
  createdAt: Date;
  actionTaken: string | null;
  refundAmount: number;
  publisher: {
    domain: string | null;
    companyName: string | null;
  };
  advertiser: {
    companyName: string | null;
    walletAddress: string | null;
  };
  auctionId: string | null;
  impression: {
    fingerprint: string | null;
    ipAddress: string | null;
    countryCode: string | null;
  };
}

interface FraudStats {
  total: number;
  open: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  avgConfidence: number;
  totalRefunds: number;
}

interface TypeBreakdown {
  fraudType: string;
  count: number;
  avgConfidence: number;
}

export default function FraudPage() {
  const [incidents, setIncidents] = useState<FraudIncident[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/admin/fraud?status=${statusFilter}&limit=100`
      );

      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents);
        setStats(data.stats);
        setTypeBreakdown(data.typeBreakdown);
      }
    } catch (error) {
      console.error("Error fetching fraud incidents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const filteredIncidents = incidents.filter((i) =>
    i.fraudType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.publisher?.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.advertiser?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fraud data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fraud Detection & Monitoring</h1>
          <p className="text-muted-foreground text-sm">
            Review and manage fraud incidents
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
              <CardTitle className="text-xs font-medium">Total Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-red-500">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.open}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-[var(--neon-orange)]">
                Reviewing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-orange)]">
                {stats.reviewing}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-[var(--neon-green)]">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-green)]">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  stats.avgConfidence >= 0.8
                    ? "text-red-500"
                    : stats.avgConfidence >= 0.5
                    ? "text-[var(--neon-orange)]"
                    : "text-[var(--neon-green)]"
                )}
              >
                {(stats.avgConfidence * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">Total Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(stats.totalRefunds)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Type Breakdown */}
        <Card className="card-glow lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Fraud Types</CardTitle>
          </CardHeader>
          <CardContent>
            {typeBreakdown.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No incidents recorded
              </div>
            ) : (
              <div className="space-y-3">
                {typeBreakdown.map((type) => {
                  const maxCount = Math.max(...typeBreakdown.map((t) => t.count), 1);
                  const width = (type.count / maxCount) * 100;
                  return (
                    <div key={type.fraudType} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type.fraudType.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">{type.count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--neon-purple)]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(type.avgConfidence * 100)}% avg confidence
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fraud Level Indicator */}
        <Card className="card-glow lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Platform Fraud Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-full py-4">
              {stats && stats.avgConfidence >= 0.8 ? (
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-2 animate-pulse" />
                  <div className="text-xl font-bold text-red-500">HIGH</div>
                  <div className="text-sm text-muted-foreground">
                    High confidence fraud detected
                  </div>
                </div>
              ) : stats && stats.avgConfidence >= 0.5 ? (
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-[var(--neon-orange)] mx-auto mb-2" />
                  <div className="text-xl font-bold text-[var(--neon-orange)]">
                    MEDIUM
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Moderate fraud activity
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-[var(--neon-green)] mx-auto mb-2" />
                  <div className="text-xl font-bold text-[var(--neon-green)]">LOW</div>
                  <div className="text-sm text-muted-foreground">
                    Fraud activity within normal range
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by type, publisher, or advertiser..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Incidents Table */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Fraud Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No incidents match your filters."
                : "No fraud incidents recorded."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize"
                        >
                          {incident.fraudType?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-12 h-2 rounded-full overflow-hidden bg-secondary",
                              incident.confidenceScore >= 0.8
                                ? "bg-red-500/20"
                                : incident.confidenceScore >= 0.5
                                ? "bg-[var(--neon-orange)]/20"
                                : "bg-[var(--neon-green)]/20"
                            )}
                          >
                            <div
                              className={cn(
                                "h-full",
                                incident.confidenceScore >= 0.8
                                  ? "bg-red-500"
                                  : incident.confidenceScore >= 0.5
                                  ? "bg-[var(--neon-orange)]"
                                  : "bg-[var(--neon-green)]"
                              )}
                              style={{ width: `${incident.confidenceScore * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">
                            {(incident.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            incident.status === "open" &&
                              "bg-red-500/20 text-red-500 border-red-500/30",
                            incident.status === "reviewing" &&
                              "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]/30",
                            incident.status === "resolved" &&
                              "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30",
                            incident.status === "dismissed" &&
                              "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          )}
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {incident.publisher?.domain || incident.publisher?.companyName || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {incident.advertiser?.companyName || shortenAddress(incident.advertiser?.walletAddress || "")}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {incident.impression?.ipAddress || "-"}
                      </TableCell>
                      <TableCell>
                        {incident.impression?.countryCode || "-"}
                      </TableCell>
                      <TableCell>
                        {incident.refundAmount > 0
                          ? formatCurrency(incident.refundAmount)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(incident.createdAt).toLocaleString()}
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
