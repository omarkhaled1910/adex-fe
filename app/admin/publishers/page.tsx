"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Globe, DollarSign, TrendingUp, CheckCircle, Grid3X3, List } from "lucide-react";
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
  usePublishers,
  type Publisher,
  type PublisherStats,
} from "@/lib/hooks/use-admin-data";
import { cn, formatCurrency } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function PublishersDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const refetchIntervalMs = refreshInterval > 0 ? refreshInterval * 1000 : false;

  const { data, isLoading, isError, error } = usePublishers(
    statusFilter,
    currentPage,
    ITEMS_PER_PAGE,
    refetchIntervalMs
  );

  const stats = data?.stats;
  const publishers = data?.publishers || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Client-side search filter
  const filteredPublishers = publishers.filter((p) =>
    p.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayPublishers = searchTerm ? filteredPublishers : publishers;

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Globe className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading publishers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading publishers</p>
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
          <h1 className="text-2xl font-bold">Publishers Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all publishers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshControl
            defaultInterval={10}
            onRefresh={async () => {
              await queryClient.invalidateQueries({ queryKey: ["admin", "publishers"] });
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

      {/* Publishers Grid/Table */}
      {displayPublishers.length === 0 ? (
        <Card className="card-glow">
          <CardContent className="text-center py-12 text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No publishers match your filters."
              : "No publishers found."}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Publishers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayPublishers.map((publisher) => (
                <PublisherCard key={publisher.id} publisher={publisher} />
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
            <CardTitle>Publishers</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {displayPublishers.map((publisher) => (
                    <TableRow key={publisher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{publisher.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>{publisher.company_name || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={publisher.status} />
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

// Publisher Card Component
function PublisherCard({ publisher }: { publisher: Publisher }) {
  return (
    <Card className="card-glow hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{publisher.domain}</span>
          </div>
          <StatusBadge status={publisher.status} />
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {publisher.company_name || "No company name"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tier</span>
          <Badge variant="secondary" className="text-xs">
            {publisher.tier}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auctions</span>
          <span className="text-sm font-medium">{publisher.auction_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Earnings</span>
          <span className="text-sm font-medium text-[var(--neon-green)]">
            {formatCurrency(publisher.total_earnings)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pending</span>
          <span className="text-sm font-medium text-[var(--neon-orange)]">
            {formatCurrency(publisher.pending_earnings)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Verified</span>
          {publisher.domain_verified ? (
            <CheckCircle className="h-4 w-4 text-[var(--neon-green)]" />
          ) : (
            <span className="text-xs text-muted-foreground">No</span>
          )}
        </div>
        {publisher.website_category && (
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {publisher.website_category}
            </span>
          </div>
        )}
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
