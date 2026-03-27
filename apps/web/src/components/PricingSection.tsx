"use client";

import { useGenerateCheckout } from "@/lib/hooks";

export function PricingSection() {
  const { mutate: generateCheckout, isPending: isCheckoutLoading } =
    useGenerateCheckout();

  const handleGetStarted = (plan: "free" | "monthly" | "yearly") => {
    if (plan === "free") {
      // Redirect to signup or dashboard
      window.location.href = "/auth";
    } else {
      // Generate checkout for paid plans
      generateCheckout();
    }
  };

  return (
    <section className="max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
      <div className="flex flex-col w-full mb-12">
        <div className="flex items-end justify-between w-full pb-5">
          <div className="flex gap-2 items-center">
            <span className="w-8 h-px bg-[#FF7F50]"></span>
            <span className="uppercase text-xs font-semibold text-[#FF7F50] tracking-[0.2em]">
              PRICING
            </span>
          </div>
        </div>
        <div className="w-full h-px bg-neutral-200 mb-8"></div>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
          <h2 className="text-5xl lg:text-7xl leading-tight text-neutral-900 tracking-tight max-w-3xl font-instrument-serif">
            Pricing that scales with your team
          </h2>
          <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
            <p className="leading-relaxed text-base text-neutral-600">
              Choose the plan that fits your workflow. Notto is built to support
              you from your first annotation to enterprise-scale collaboration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Free */}
        <div className="lg:col-span-1">
          <div className="hover:shadow-md transition-shadow bg-white h-full border-neutral-200 border rounded-lg px-8 py-10 shadow-sm flex flex-col">
            <h3 className="text-3xl tracking-tight mb-2 font-normal">Free</h3>
            <p className="text-neutral-500 mb-8 text-sm">
              Perfect for individuals just starting out.
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-normal">$0</span>
              <span className="text-neutral-400 text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                1 Workspace
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                3 Projects
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Basic annotations
              </li>
            </ul>
            <button
              onClick={() => handleGetStarted("free")}
              className="hover:bg-neutral-50 transition-colors font-medium text-neutral-950 w-full border-neutral-200 border rounded-full pt-4 pb-4"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Monthly */}
        <div className="lg:col-span-1">
          <div className="hover:shadow-md transition-shadow bg-neutral-50 h-full border-neutral-200 border rounded-lg px-8 py-10 shadow-sm flex flex-col">
            <h3 className="text-3xl tracking-tight mb-2 font-normal">
              Monthly
            </h3>
            <p className="text-neutral-500 mb-8 text-sm">
              For teams that need flexibility.
            </p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-normal">$4</span>
              <span className="text-neutral-400 text-sm">/mo</span>
              <span className="text-xs text-neutral-400 line-through ml-1">
                $8
              </span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                5 Workspaces
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                30 Projects
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                10 Team members
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Unlimited annotations
              </li>
            </ul>
            <button
              onClick={() => handleGetStarted("monthly")}
              disabled={isCheckoutLoading}
              className="hover:bg-neutral-800 transition-colors font-medium text-white bg-neutral-950 w-full rounded-full pt-4 pb-4 disabled:opacity-50"
            >
              {isCheckoutLoading ? "Loading..." : "Start Free Trial"}
            </button>
          </div>
        </div>

        {/* Yearly */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-950 border border-white/10 rounded-lg px-8 py-10 h-full text-white relative shadow-2xl overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl"></div>
            <div className="absolute -top-3 -right-3 bg-[#FF7F50] text-white text-xs font-semibold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            <h3 className="text-3xl tracking-tight mb-2 font-normal">Yearly</h3>
            <p className="text-neutral-400 mb-8 text-sm">
              Save 71% with annual billing.
            </p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-normal">$28</span>
              <span className="text-neutral-500 text-sm">/year</span>
              <span className="text-xs text-neutral-500 line-through ml-1">
                $98
              </span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#FF7F50]"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                5 Workspaces
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#FF7F50]"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                30 Projects
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#FF7F50]"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                10 Team members
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#FF7F50]"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Unlimited annotations
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#FF7F50]"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Webhook integrations
              </li>
            </ul>
            <button
              onClick={() => handleGetStarted("yearly")}
              disabled={isCheckoutLoading}
              className="hover:opacity-90 transition-opacity font-medium text-white bg-[#FF7F50] w-full rounded-full pt-4 pb-4 disabled:opacity-50"
            >
              {isCheckoutLoading ? "Loading..." : "Get Yearly Access →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
