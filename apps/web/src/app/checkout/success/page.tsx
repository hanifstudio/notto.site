"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLicenseStatus } from "@/lib/hooks";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { data: licenseStatus, isLoading, refetch } = useLicenseStatus();

  useEffect(() => {
    // Poll for license activation every 3 seconds
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (licenseStatus?.hasLifetimeAccess && !shouldRedirect) {
      setShouldRedirect(true);
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [licenseStatus, router, shouldRedirect]);

  const isActivating = isLoading || !licenseStatus?.hasLifetimeAccess;
  const showError = !isLoading && !licenseStatus?.hasLifetimeAccess;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {isActivating ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <iconify-icon
                icon="lucide:loader-2"
                className="text-3xl text-green-600 animate-spin"
              ></iconify-icon>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Activating Your License...
            </h1>
            <p className="text-gray-600">
              Please wait while we set up your lifetime access.
            </p>
          </>
        ) : showError ? (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <iconify-icon
                icon="lucide:alert-circle"
                className="text-3xl text-yellow-600"
              ></iconify-icon>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing...
            </h1>
            <p className="text-gray-600 mb-4">
              Your purchase is being processed. This may take a few moments.
            </p>
            <p className="text-sm text-gray-500">
              Checking status automatically...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <iconify-icon
                icon="lucide:check-circle"
                className="text-3xl text-green-600"
              ></iconify-icon>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Lifetime Access! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              Your purchase was successful. You now have unlimited access to all
              features.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-green-800 mb-2">
                <iconify-icon icon="lucide:check"></iconify-icon>
                <span>Unlimited workspaces</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800 mb-2">
                <iconify-icon icon="lucide:check"></iconify-icon>
                <span>Unlimited projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <iconify-icon icon="lucide:check"></iconify-icon>
                <span>Unlimited team members</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}
