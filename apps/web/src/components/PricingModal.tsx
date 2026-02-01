"use client";

import { useEffect } from "react";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "workspace" | "project";
}

export function PricingModal({ isOpen, onClose, trigger }: PricingModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title =
    trigger === "workspace"
      ? "Workspace Creation Temporarily Unavailable"
      : "Project Limit Reached";

  const description =
    trigger === "workspace"
      ? "We're preparing something special for you!"
      : "You've reached the maximum number of projects for the free tier.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Gradient header background */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 opacity-10" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
          aria-label="Close modal"
        >
          <iconify-icon icon="lucide:x" className="text-xl"></iconify-icon>
        </button>

        {/* Content */}
        <div className="relative p-8">
          {/* Icon */}

          {/* Title */}
          <h2 className="text-2xl font-instrument-serif text-neutral-900 text-center mb-3">
            {title}
          </h2>

          {/* Description */}
          <p className="text-neutral-600 text-center mb-6">{description}</p>

          {/* Pricing announcement */}
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl p-6 mb-6 border border-orange-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <iconify-icon
                  icon="lucide:zap"
                  className="text-white text-lg"
                ></iconify-icon>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Lifetime Pricing Coming Soon
                </h3>
                <p className="text-sm text-neutral-600">
                  We're finalizing our payment integration with Lemon Squeezy.
                  Soon you'll be able to unlock unlimited workspaces and
                  projects with a one-time payment.
                </p>
              </div>
            </div>

            {/* Features preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <iconify-icon
                  icon="lucide:check"
                  className="text-green-600"
                ></iconify-icon>
                <span>Unlimited workspaces</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <iconify-icon
                  icon="lucide:check"
                  className="text-green-600"
                ></iconify-icon>
                <span>Unlimited projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <iconify-icon
                  icon="lucide:check"
                  className="text-green-600"
                ></iconify-icon>
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <iconify-icon
                  icon="lucide:check"
                  className="text-green-600"
                ></iconify-icon>
                <span>One-time payment, lifetime access</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-4">
              Want to be notified when lifetime pricing launches?
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Got it, I'll wait!
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
