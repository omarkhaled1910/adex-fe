import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CampaignFormData } from "@/lib/validations/campaign";

export interface Campaign {
  id: string;
  name: string;
  status: string;
  total_budget: number;
  daily_budget: number | null;
  spent_amount: number;
  max_bid: number;
  bid_strategy: string;
  target_geos: string[] | null;
  target_devices: string[] | null;
  target_os: string[] | null;
  target_browsers: string[] | null;
  start_date: string;
  end_date: string | null;
  max_impressions_per_user: number | null;
  max_impressions_per_day: number | null;
  active_hours: number[] | null;
  active_days: number[] | null;
  impressions_served: number;
  clicks: number;
  avg_ctr: number | null;
  created_at: string;
  updated_at: string;
}

// Fetch all campaigns
async function fetchCampaigns(status?: string): Promise<Campaign[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  const res = await fetch(`/api/campaigns?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch campaigns");
  }
  return res.json();
}

// Fetch single campaign
async function fetchCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch campaign");
  }
  return res.json();
}

// Create campaign
async function createCampaign(data: CampaignFormData): Promise<Campaign> {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create campaign");
  }
  return res.json();
}

// Update campaign
async function updateCampaign({
  id,
  data,
}: {
  id: string;
  data: Partial<CampaignFormData>;
}): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update campaign");
  }
  return res.json();
}

// Delete campaign
async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete campaign");
  }
}

// React Query hooks
export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: ["campaigns", status],
    queryFn: () => fetchCampaigns(status),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => fetchCampaign(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.setQueryData(["campaigns", data.id], data);
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
