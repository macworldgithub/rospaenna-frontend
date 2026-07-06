"use client";

import React, { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      '"Rosapenna is simply the finest links golf destination in Ireland. Three world-class courses, stunning scenery, and hospitality that makes you feel like royalty."',
    author: "Golf Digest",
    role: "Course Review",
  },
  {
    quote:
      '"St Patrick\'s Links is a masterpiece. Combined with Sandy Hills and Old Tom Morris, Rosapenna offers an unmatched triple links experience."',
    author: "Golf Monthly",
    role: "Editor's Pick",
  },
  {
    quote:
      '"We came for one round and stayed for three. Playing all three courses was the highlight of our golfing year. The Three Links Ticket is exceptional value."',
    author: "James M.",
    role: "Guest, London",
  },
];

export default function GolfHeritage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#050505] text-white py-14 px-6 overflow-hidden">
      <div className="max-w-350 mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}

          <div>
            <p className="uppercase tracking-[0.45em] text-[12px] text-[#D6AE47]">
              A Legacy of Excellence
            </p>

            <div className="w-16 h-px bg-[#D6AE47] mt-5 mb-10" />

            <h2 className="font-serif text-[52px] leading-15 font-semibold">
              Over 130 Years of
              <br />
              <span className="text-[#D6AE47]">Golfing Heritage</span>
            </h2>

            <div className="mt-8 space-y-10 text-[#A9A9A9] leading-8 text-[16px] max-w-162.5">
              <p>
                Since Old Tom Morris first set foot on the Rosapenna dunes in
                1893, this stretch of Donegal coastline has been hallowed ground
                for golfers. What began as a single links course has evolved
                into one of the world's premier golf destinations.
              </p>

              <p>
                Today, three championship links courses — each a masterpiece of
                its era — offer an experience that spans the entire history of
                links golf design, from Victorian classicism to 21st-century
                innovation.
              </p>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-16 mt-10">
              <div>
                <h3 className="font-serif text-[58px] font-bold text-[#D6AE47]">
                  1893
                </h3>

                <p className="uppercase tracking-[0.35em] text-[11px] text-[#8A8A8A] mt-2">
                  Established
                </p>
              </div>

              <div>
                <h3 className="font-serif text-[58px] font-bold text-[#D6AE47]">
                  54
                </h3>

                <p className="uppercase tracking-[0.35em] text-[11px] text-[#8A8A8A] mt-2">
                  Championship Holes
                </p>
              </div>

              <div>
                <h3 className="font-serif text-[58px] font-bold text-[#D6AE47]">
                  3
                </h3>

                <p className="uppercase tracking-[0.35em] text-[11px] text-[#8A8A8A] mt-2">
                  World-Class Links
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative">
            {/* Decorative Lines */}

            <div className="absolute top-0 right-0 w-14 h-px bg-[#6d5720]" />
            <div className="absolute right-0 top-0 h-14 w-px bg-[#6d5720]" />

            <div className="absolute bottom-0 left-0 w-14 h-px bg-[#6d5720]" />
            <div className="absolute bottom-0 left-0 h-14 w-px bg-[#6d5720]" />

            <div className="border border-[#272113] bg-[#070707] min-h-107.5 px-12 py-14 flex flex-col justify-between">
              <div
                key={active}
                className="transition-all duration-700 animate-fade"
              >
                <div className="text-[#4e431f] text-7xl font-serif leading-none">
                  ❞
                </div>

                <p className="text-[16px] leading-10 italic font-serif text-white">
                  {testimonials[active].quote}
                </p>

                <div className="mt-8">
                  <h4 className="text-[#D6AE47] text-xl font-semibold">
                    {testimonials[active].author}
                  </h4>

                  <p className="text-[#8A8A8A] mt-2">
                    {testimonials[active].role}
                  </p>
                </div>
              </div>

              {/* Indicators */}

              <div className="flex items-center gap-3 mt-10">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`transition-all duration-300 ${
                      active === index
                        ? "w-7 h-2 bg-[#D6AE47]"
                        : "w-2 h-2 bg-[#4C4C4C]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#1d1d1d] mt-14" />
      </div>

      <style jsx>{`
        @keyframes fade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade {
          animation: fade 0.6s ease;
        }
      `}</style>
    </section>
  );
}
