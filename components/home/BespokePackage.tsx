"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  BedDouble,
  Flag,
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    title: "Dates",
    icon: Calendar,
  },
  {
    title: "Guests",
    icon: Users,
  },
  {
    title: "Rooms",
    icon: BedDouble,
  },
  {
    title: "Golf",
    icon: Flag,
  },
  {
    title: "Review",
    icon: Check,
  },
];

export default function BespokePackage() {
  const [night, setNight] = useState(2);

  return (
    <section className="bg-[#050505] py-10 px-5">
      <div className="max-w-[920px] mx-auto">
        {/* Heading */}

        <p className="uppercase tracking-[0.45em] text-[11px] text-[#D4AF55]">
          AI-Powered Concierge
        </p>

        <div className="w-16 h-px bg-[#D4AF55] mt-5 mb-10"></div>

        <h2 className="font-serif font-semibold text-white text-2xl sm:text-4xl leading-tight">
          Build Your <span className="text-[#D4AF55]">Bespoke Package</span>
        </h2>

        <p className="text-[#A8A8A8] text-md md:text-lg leading-8 mt-6 max-w-3xl">
          Our intelligent booking assistant will guide you through creating the
          perfect stay and golf experience.
        </p>

        {/* Stepper */}

        <div className="mt-10 overflow-x-auto">
          <div className="flex items-center min-w-[760px]">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 flex items-center justify-center border
                      ${
                        index === 0
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : "border-[#323232] text-[#7d7d7d]"
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <span
                      className={`ml-3 uppercase tracking-[0.3em] text-[11px]
                      ${index === 0 ? "text-[#D4AF55]" : "text-[#757575]"}`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index !== steps.length - 1 && (
                    <div className="flex-1 h-px bg-[#222] mx-6"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}

        <div className="mt-14 border border-[#181818] bg-[#070707] p-6 sm:p-10 lg:p-14">
          {/* Notice */}

          <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
            <Sparkles size={18} className="text-[#D4AF55] mt-1 flex-shrink-0" />

            <p className="text-[#E2BE69] leading-8">
              For the best links golf experience, we recommend visiting between
              May and September when Donegal's weather is at its finest. Midweek
              stays often offer the best availability on our championship
              courses.
            </p>
          </div>

          {/* Arrival */}

          <div className="mt-6">
            <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
              Arrival Date
            </label>

            <div className="relative">
              <input
                type="date"
                className="w-full bg-[#0B0B0B] border border-[#181818] h-16 px-5 text-white outline-none focus:border-[#D4AF55]"
              />

              <Calendar
                size={18}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>
          </div>

          {/* Nights */}

          <div className="mt-6">
            <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
              Number of Nights
            </label>

            <div className="flex flex-wrap gap-3">
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setNight(num)}
                  className={`w-8 h-8 border transition
                  ${
                    night === num
                      ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                      : "border-[#202020] text-white hover:border-[#D4AF55]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}

          <div className="border-t border-[#171717] mt-10 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button className="uppercase tracking-[0.3em] text-[11px] text-[#666] hover:text-white flex items-center gap-2">
              <ArrowLeft size={15} />
              Previous
            </button>

            <button className="bg-[#D4AF55] hover:bg-[#c7a042] transition-all px-10 h-12 min-w-[170px] uppercase tracking-[0.35em] text-[11px] font-semibold text-black flex items-center justify-center gap-3">
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
