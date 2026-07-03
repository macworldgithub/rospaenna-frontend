import React from "react";

export default function GolfHeritage() {
  return (
    <section className="bg-[#050505] text-white py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Side */}
          <div>
            {/* Small Heading */}
            <div className="mb-8">
              <p className="uppercase tracking-[0.45em] text-[11px] text-[#D7AE47]">
                A Legacy of Excellence
              </p>

              <div className="w-14 h-px bg-[#D7AE47] mt-4"></div>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl lg:text-5xl leading-tight font-semibold">
              Over 130 Years of
              <br />
              <span className="text-[#D7AE47]">Golfing Heritage</span>
            </h2>

            {/* Description */}
            <div className="mt-4 space-y-8 text-[#A7A7A7] leading-9 text-md">
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
            <div className="grid grid-cols-3 gap-8 mt-10">
              <div>
                <h3 className="text-4xl font-serif font-bold text-[#D7AE47]">
                  1893
                </h3>

                <p className="uppercase tracking-[0.25em] text-[11px] text-[#8E8E8E] mt-2">
                  Established
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-serif font-bold text-[#D7AE47]">
                  54
                </h3>

                <p className="uppercase tracking-[0.25em] text-[11px] text-[#8E8E8E] mt-2">
                  Championship Holes
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-serif font-bold text-[#D7AE47]">
                  3
                </h3>

                <p className="uppercase tracking-[0.25em] text-[11px] text-[#8E8E8E] mt-2">
                  World-Class Links
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="relative">
            {/* Border */}
            <div className="absolute top-0 right-0 w-14 h-px bg-[#D7AE47]"></div>
            <div className="absolute bottom-0 left-0 w-14 h-px bg-[#D7AE47]"></div>

            <div className="border border-[#3A311A] bg-[#070707] p-12">
              {/* Quote Icon */}
              <div className="text-[#D7AE47] text-6xl leading-none">❞</div>

              {/* Quote */}
              <p className="mt-8 text-xl italic leading-10 text-[#F5F5F5] font-serif">
                "We came for one round and stayed for three. Playing all three
                courses was the highlight of our golfing year. The Three Links
                Ticket is exceptional value."
              </p>

              {/* Author */}
              <div className="mt-12">
                <h4 className="text-[#D7AE47] font-semibold">James M.</h4>

                <p className="text-[#8F8F8F] mt-2">Guest, London</p>
              </div>

              {/* Slider Indicators */}
              <div className="flex items-center gap-3 mt-14">
                <span className="w-2 h-2 bg-[#555]"></span>

                <span className="w-2 h-2 bg-[#555]"></span>

                <span className="w-6 h-2 bg-[#D7AE47]"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="border-b border-[#262626] mt-24"></div>
      </div>
    </section>
  );
}
