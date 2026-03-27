import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";

// ============================================================================
// Types
// ============================================================================

export interface RemainingSlots {
  total: number;
  sold: number;
  remaining: number;
}

export interface LicenseStatus {
  tier: "free" | "lifetime";
  isActive: boolean;
  hasLifetimeAccess: boolean;
}

export interface CheckoutUrlResponse {
  checkoutUrl: string;
}

// ============================================================================
// Query Keys
// ============================================================================

export const lemonsqueezyKeys = {
  all: ["lemonsqueezy"] as const,
  slots: () => [...lemonsqueezyKeys.all, "slots"] as const,
  license: () => [...lemonsqueezyKeys.all, "license"] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch remaining lifetime slots
 * Uses TanStack Query for caching and automatic refetching
 */
export function useRemainingSlots() {
  return useQuery({
    queryKey: lemonsqueezyKeys.slots(),
    queryFn: async () => {
      const data = await apiClient.getRemainingSlots();
      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Hook to validate current user's license status
 * Requires authentication
 */
export function useLicenseStatus() {
  return useQuery({
    queryKey: lemonsqueezyKeys.license(),
    queryFn: async () => {
      const data = await apiClient.validateLicense();
      return data;
    },
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to generate checkout URL and redirect to LemonSqueezy
 * Requires authentication
 */
export function useGenerateCheckout() {
  return useMutation({
    mutationFn: async () => {
      const data = await apiClient.generateCheckoutUrl();
      return data;
    },
    onSuccess: (data) => {
      // Redirect to LemonSqueezy checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      console.error("Failed to generate checkout URL:", error);
    },
  });
}

/**
 * Hook to manually activate a license key (fallback method)
 * Requires authentication
 */
export function useActivateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (licenseKey: string) => {
      const response = await apiClient.fetch<{ message: string }>(
        "/licenses/activate",
        {
          method: "POST",
          body: JSON.stringify({ licenseKey }),
        },
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate license status to refetch updated data
      queryClient.invalidateQueries({ queryKey: lemonsqueezyKeys.license() });
    },
    onError: (error) => {
      console.error("Failed to activate license:", error);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if user has lifetime access
 * Convenience wrapper around useLicenseStatus
 */
export function useHasLifetimeAccess() {
  const { data, isLoading, error } = useLicenseStatus();

  return {
    hasLifetimeAccess: data?.hasLifetimeAccess ?? false,
    isLoading,
    error,
  };
}

/**
 * Hook to check if slots are available
 * Convenience wrapper around useRemainingSlots
 */
export function useSlotsAvailable() {
  const { data, isLoading, error } = useRemainingSlots();

  return {
    available: (data?.remaining ?? 0) > 0,
    remaining: data?.remaining ?? 0,
    isLoading,
    error,
  };
}
