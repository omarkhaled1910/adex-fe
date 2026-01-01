import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Creative {
  id: string;
  campaign_id: string;
  name: string | null;
  format: string;
  headline: string | null;
  description: string | null;
  cta_text: string | null;
  landing_url: string;
  width: number | null;
  height: number | null;
  review_status: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
  assets: Record<string, any>;
  campaign_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreativeFormData {
  campaign_id: string;
  name?: string;
  format: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  landing_url: string;
  width?: number;
  height?: number;
  assets?: Record<string, any>;
  status?: string;
}

// Fetch all creatives for the current advertiser
async function fetchCreatives(campaignId?: string): Promise<Creative[]> {
  const params = new URLSearchParams();
  if (campaignId) params.set("campaign_id", campaignId);

  const res = await fetch(`/api/creatives?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch creatives");
  }
  return res.json();
}

// Fetch single creative
async function fetchCreative(id: string): Promise<Creative> {
  const res = await fetch(`/api/creatives/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch creative");
  }
  return res.json();
}

// Create creative
async function createCreative(data: CreativeFormData): Promise<Creative> {
  const res = await fetch("/api/creatives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create creative");
  }
  return res.json();
}

// Update creative
async function updateCreative({
  id,
  data,
}: {
  id: string;
  data: Partial<CreativeFormData>;
}): Promise<Creative> {
  const res = await fetch(`/api/creatives/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update creative");
  }
  return res.json();
}

// Delete creative
async function deleteCreative(id: string): Promise<void> {
  const res = await fetch(`/api/creatives/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete creative");
  }
}

// React Query hooks
export function useCreatives(campaignId?: string) {
  return useQuery({
    queryKey: ["creatives", campaignId],
    queryFn: () => fetchCreatives(campaignId),
  });
}

export function useCreative(id: string) {
  return useQuery({
    queryKey: ["creatives", id],
    queryFn: () => fetchCreative(id),
    enabled: !!id,
  });
}

export function useCreateCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCreative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    },
  });
}

export function useUpdateCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCreative,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      queryClient.setQueryData(["creatives", data.id], data);
    },
  });
}

export function useDeleteCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCreative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    },
  });
}
