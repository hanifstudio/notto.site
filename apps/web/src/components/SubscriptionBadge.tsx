"use client";

import { useAuth } from "@/lib/auth-context";

export function SubscriptionBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const isLifetime =
    user.subscriptionTier === "lifetime" || user.hasLifetimeAccess;

  if (!isLifetime) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
        <iconify-icon icon="lucide:user" className="text-sm"></iconify-icon>
        <span>Free</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-medium shadow-sm">
      <iconify-icon icon="lucide:crown" className="text-sm"></iconify-icon>
      <span>Lifetime</span>
    </div>
  );
}
