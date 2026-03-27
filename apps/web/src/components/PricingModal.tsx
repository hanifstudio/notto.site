"use client";

import { useEffect } from "react";
import { useRemainingSlots, useGenerateCheckout } from "@/lib/hooks";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "workspace" | "project" | "team";
}

export function PricingModal({ isOpen, onClose, trigger }: PricingModalProps) {
  const { data: slotsData, isLoading: isSlotsLoading } = useRemainingSlots();
  const { mutate: generateCheckout, isPending: isCheckoutLoading } =
    useGenerateCheckout();

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

  const handleUpgrade = () => {
    generateCheckout();
  };

  type BenefitType = {
    label: string;
    icon: string;
  };

  const benefit: BenefitType[] = [
    {
      label: "Run up to 5 Workspaces & 30 Projects",
      icon: "lucide:check",
    },
    {
      label: "Invite up to 10 Team Members",
      icon: "lucide:check",
    },
    {
      label: "Unlimited annotations",
      icon: "lucide:check",
    },
    {
      label: "Automation ready with webhooks",
      icon: "lucide:check",
    },
  ];

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Gradient header background */}
        <div className="absolute top-0 left-0 right-0 h-fit bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 opacity-10" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex flex-col items-center justify-center absolute size-8 top-4 right-4 z-10 text-neutral-100 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
          aria-label="Close modal"
        >
          <iconify-icon icon="lucide:x" className="text-xl"></iconify-icon>
        </button>

        {/* Content */}
        <div className="relative p-8 text-white">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-instrument-serif text-center leading-tighter mb-10">
            Yearly Access
          </h2>

          <div className="mx-auto w-fit mb-5">
            <p className="leading-tight text-center mb-2">
              <span className=" font-instrument-serif line-through opacity-75 text-xl mr-1">
                $144.00
              </span>{" "}
              80% off
            </p>

            <h3 className="text-6xl md:text-7xl font-instrument-serif font-semibold text-center ">
              $28<span className="text-4xl">.00</span>
            </h3>
          </div>

          {/* Pricing announcement */}
          <div className="mx-auto w-fit mb-10">
            {/* Features preview */}
            <div className="space-y-2 flex flex-col items-center justify-center">
              {benefit.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 w-fit">
                  <iconify-icon
                    icon={benefit.icon}
                    className="text-green-300 text-lg"
                  ></iconify-icon>
                  <p>{benefit.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3 items-center flex flex-col">
            <button
              onClick={handleUpgrade}
              disabled={isCheckoutLoading}
              className="w-fit px-6 py-3 bg-white text-pink-600 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCheckoutLoading ? "Loading..." : "Get Yearly Access →"}
            </button>
            <p className="text-xs">
              Only{" "}
              {!isSlotsLoading && slotsData
                ? `${slotsData.remaining} slots left`
                : "Limited slots available"}
            </p>
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
