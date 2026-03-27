"use client";

import { useRouter } from "next/navigation";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <iconify-icon
            icon="lucide:x-circle"
            className="text-3xl text-gray-600"
          ></iconify-icon>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Checkout Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your purchase was cancelled. No charges were made to your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            Return to Dashboard
          </button>
          <p className="text-sm text-gray-500">
            Changed your mind? You can upgrade anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
