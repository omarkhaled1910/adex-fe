"use client";

import { useState, useEffect, useCallback } from "react";
import type { Publisher, AdSlot, CreateAdSlotInput, UpdateAdSlotInput } from "@/lib/types/publisher";

// Demo publisher data (for development)
const DEMO_PUBLISHER: Publisher = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  company_name: "Demo Publisher Inc.",
  domain: "example.com",
  email: "publisher@example.com",
  api_key: "pk_demo_api_key_for_testing_purposes",
  wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
  status: "active",
  tier: "standard",
  total_earnings: 1250.50,
  pending_earnings: 350.25,
  withdrawn_earnings: 900.25,
  domain_verified: true,
  verification_token: "abc123def456",
  verified_at: "2024-01-15T10:30:00Z",
  website_category: "technology",
  monthly_pageviews: 500000,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-20T00:00:00Z",
};

const DEMO_AD_SLOTS: AdSlot[] = [
  {
    id: "slot-1",
    publisher_id: DEMO_PUBLISHER.id,
    slot_name: "Homepage Leaderboard",
    slot_type: "banner",
    width: 728,
    height: 90,
    floor_price: 0.50,
    impressions_served: 125000,
    clicks: 2500,
    total_revenue: 312.50,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "slot-2",
    publisher_id: DEMO_PUBLISHER.id,
    slot_name: "Sidebar Rectangle",
    slot_type: "banner",
    width: 300,
    height: 250,
    floor_price: 0.25,
    impressions_served: 89000,
    clicks: 1780,
    total_revenue: 178.00,
    status: "active",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "slot-3",
    publisher_id: DEMO_PUBLISHER.id,
    slot_name: "In-Stream Video",
    slot_type: "video",
    width: 640,
    height: 360,
    floor_price: 2.00,
    impressions_served: 25000,
    clicks: 875,
    total_revenue: 450.00,
    status: "active",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
];

// usePublisher - Hook for publisher data
export function usePublisher() {
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublisher = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/publisher/me");
      if (!response.ok) {
        throw new Error("Failed to fetch publisher data");
      }

      const data = await response.json();
      setPublisher(data.publisher);
    } catch (err) {
      console.error("Error fetching publisher:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use demo data in development
      setPublisher(DEMO_PUBLISHER);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublisher();
  }, [fetchPublisher]);

  return { publisher, loading, error, refetch: fetchPublisher };
}

// useAdSlots - Hook for ad slots management
export function useAdSlots() {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/publisher/adslots");
      if (!response.ok) {
        throw new Error("Failed to fetch ad slots");
      }

      const data = await response.json();
      setAdSlots(data.ad_slots || []);
    } catch (err) {
      console.error("Error fetching ad slots:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Use demo data in development
      setAdSlots(DEMO_AD_SLOTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdSlot = useCallback(async (input: CreateAdSlotInput) => {
    try {
      const response = await fetch("/api/publisher/adslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create ad slot");
      }

      const data = await response.json();
      setAdSlots((prev) => [data.ad_slot, ...prev]);
      return data.ad_slot;
    } catch (err) {
      console.error("Error creating ad slot:", err);
      throw err;
    }
  }, []);

  const updateAdSlot = useCallback(async (id: string, input: UpdateAdSlotInput) => {
    try {
      const response = await fetch(`/api/publisher/adslots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ad slot");
      }

      const data = await response.json();
      setAdSlots((prev) =>
        prev.map((slot) => (slot.id === id ? data.ad_slot : slot))
      );
      return data.ad_slot;
    } catch (err) {
      console.error("Error updating ad slot:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAdSlots();
  }, [fetchAdSlots]);

  return { adSlots, loading, error, refetch: fetchAdSlots, createAdSlot, updateAdSlot };
}

// usePublisherAnalytics - Hook for publisher analytics
export function usePublisherAnalytics(days: number = 30) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/publisher/analytics?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

// useDomainVerification - Hook for domain verification
export function useDomainVerification(publisherId: string) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkVerification = useCallback(async () => {
    try {
      const response = await fetch(`/api/publisher/${publisherId}/verify-domain`);
      if (!response.ok) {
        throw new Error("Failed to check verification status");
      }

      const data = await response.json();
      setVerified(data.domain_verified);
      return data;
    } catch (err) {
      console.error("Error checking verification:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, [publisherId]);

  const verifyDomain = useCallback(async () => {
    try {
      setVerifying(true);
      setError(null);

      const response = await fetch(`/api/publisher/${publisherId}/verify-domain`, {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok) {
        setVerified(true);
      } else {
        setError(data.message || "Verification failed");
      }

      return data;
    } catch (err) {
      console.error("Error verifying domain:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setVerifying(false);
    }
  }, [publisherId]);

  useEffect(() => {
    checkVerification();
  }, [checkVerification]);

  return { verified, verifying, error, checkVerification, verifyDomain };
}
