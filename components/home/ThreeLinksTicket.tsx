import React from "react";

export default function ThreeLinksTicket() {
  return (
    <section className="bg-[#050505] py-10 px-6">
      <div className="max-w-7xl mx-auto border border-[#8B6A2A]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 px-10 py-12">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#C89D3D] text-lg">✦</span>

              <span className="uppercase tracking-[0.35em] text-[11px] text-[#C89D3D] font-medium">
                Three Links Ticket
              </span>
            </div>

            <h2 className="text-white text-2xl md:text-4xl font-serif font-semibold leading-tight">
              Play All Three —<span className="text-[#E5C36A]"> From €250</span>
            </h2>

            <p className="mt-5 text-[#A7A7A7] text-base leading-8 max-w-xl">
              The ultimate Rosapenna experience. Play St Patrick's, Sandy Hills,
              and Old Tom Morris Links with one exclusive ticket.
            </p>
          </div>

          {/* Button */}
          <div className="flex-shrink-0">
            <button className="bg-[#D9AE4D] hover:bg-[#c79d40] transition-all duration-300 text-black uppercase tracking-[0.3em] text-[11px] font-semibold px-10 py-5">
              Book Three Links Ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
