"use client";

export function FeaturesSection() {
  return (
    <section className="overflow-hidden border-y bg-[#ffffff] border-neutral-200 pt-24 pb-24 relative">
      <div className="z-10 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
        <div className="flex flex-col w-full mb-12">
          <div className="flex items-end justify-between w-full pb-5">
            <div className="flex gap-x-2 gap-y-2 items-center">
              <span className="w-8 h-px bg-[#FF7F50]"></span>
              <span className="uppercase text-xs font-bold text-[#FF7F50] tracking-[0.2em]">
                Why Notto?
              </span>
            </div>
          </div>
          <div className="w-full h-px bg-neutral-200 mb-8"></div>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
            <h2 className="text-5xl lg:text-7xl leading-tight text-neutral-900 tracking-tight max-w-3xl font-instrument-serif">
              Designed for non-tech savvy
            </h2>
            <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
              <p className="leading-relaxed text-base text-neutral-600">
                Stop wasting time with screenshots and lengthy descriptions.
                Notto turns visual bugs into actionable tickets instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Visual Annotations with Toolbar */}
          <div className="group flex flex-col hover:shadow-xl hover:shadow-[#FF7F50]/5 transition-all duration-500 bg-white h-[520px] border-neutral-200/60 border rounded-[40px] overflow-hidden">
            {/* Visual Demo Area */}
            <div className="relative bg-neutral-50 flex-grow p-8 flex items-center justify-center">
              {/* Floating Toolbar */}
              <div className="bg-neutral-900 text-neutral-400 rounded-full shadow-2xl px-4 py-4 flex items-center gap-2 border border-neutral-700/50 scale-150">
                <button className="w-12 h-12 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all">
                  <iconify-icon
                    icon="lucide:mouse-pointer-2"
                    width="20"
                  ></iconify-icon>
                </button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white">
                  <iconify-icon icon="lucide:square" width="20"></iconify-icon>
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white">
                  <iconify-icon
                    icon="lucide:move-up-right"
                    width="20"
                  ></iconify-icon>
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all">
                  <iconify-icon icon="lucide:type" width="20"></iconify-icon>
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all">
                  <iconify-icon icon="lucide:palette" width="20"></iconify-icon>
                </button>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col justify-between flex-grow px-10 py-8">
              <div>
                <h3 className="text-2xl text-neutral-900 mb-4 tracking-tight leading-tight font-normal">
                  Annotate directly on any webpage
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  Draw rectangles, arrows, and add text comments right on your
                  staging or production sites. No more confusing screenshots or
                  lengthy descriptions.
                </p>
              </div>
              <div className="pt-6 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Visual Feedback
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 - Image with overlay */}
          <div className="relative rounded-[40px] overflow-hidden h-[520px] bg-neutral-900 group">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
              alt="Real-time collaboration"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white pr-10">
              <span className="inline-block px-3 py-1 bg-[#FF7F50] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                Instant Sync
              </span>
              <p className="text-2xl leading-tight font-normal">
                From annotation to ticket in one click. No context switching.
              </p>
            </div>
          </div>

          {/* Card 3 - Dark Integrations Card */}
          <div className="bg-neutral-950 p-10 rounded-[40px] flex flex-col justify-between h-[520px] text-white relative hover:shadow-2xl hover:shadow-[#FF7F50]/20 transition-all duration-500">
            <div className="flex justify-between items-start">
              <span className="text-lg font-medium tracking-tight text-[#FF7F50]">
                Integrations
              </span>
              <div className="p-2 bg-white/10 rounded-full">
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
                  className="text-white"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </div>
            </div>
            <p className="text-3xl leading-[1.2] font-normal">
              Push to Linear, Jira, Asana, and more with webhooks.
            </p>
            <div className="space-y-6">
              <div className="group/link cursor-pointer">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                  Webhook Support
                </p>
                <p className="text-lg font-medium border-b border-white/10 pb-2 group-hover/link:text-[#FF7F50] transition-colors">
                  Custom Integrations
                </p>
              </div>
              <div className="group/link cursor-pointer">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                  Setup Time
                </p>
                <p className="text-lg font-medium group-hover/link:text-[#FF7F50] transition-colors">
                  &lt; 2 Minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
