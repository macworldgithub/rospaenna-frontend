"use client";

import Link from "next/link";
import { Phone, Mail, Calendar, Compass, ShieldCheck } from "lucide-react";

export default function BookingChoiceSection() {
  return (
    <section className="bg-[#070707] border border-[#DBB155]/20 p-6 sm:p-10 my-10 rounded-sm">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DBB155]/10 border border-[#DBB155]/30 rounded-full text-[#DBB155] text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Official Rosapenna Booking Channels
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Choose Your Booking Experience
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Book Stay &amp; Play packages online, reserve day visitor tee times directly on BRS Golf, or contact Reservations for bespoke itineraries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Stay & Play */}
          <div className="bg-[#0f0f0f] border border-[#DBB155]/30 hover:border-[#DBB155] p-6 rounded-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#DBB155]/15 flex items-center justify-center text-[#DBB155] mb-4">
                <Calendar size={22} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">
                Stay &amp; Play Packages
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Combine luxury resort accommodation with championship links rounds (St Patrick&apos;s, Sandy Hills, Old Tom Morris) at exclusive resident package rates.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <Link
                href="/#packages"
                className="inline-block w-full text-center bg-[#DBB155] hover:bg-[#c9a04a] text-black font-bold uppercase tracking-wider text-xs py-3 rounded-sm transition-colors"
              >
                Book Package Online
              </Link>
            </div>
          </div>

          {/* Card 2: Golf Only (BRS) */}
          <div className="bg-[#0f0f0f] border border-white/10 hover:border-[#DBB155] p-6 rounded-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300 mb-4">
                <Compass size={22} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">
                Visitor Golf Only
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Playing as a day visitor without hotel accommodation? Reserve public tee times directly on our official BRS Golf portal.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <a
                href="https://visitors.brsgolf.com/rosapenna#/course/1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-transparent border border-[#DBB155] text-[#DBB155] hover:bg-[#DBB155] hover:text-black font-bold uppercase tracking-wider text-xs py-3 rounded-sm transition-all"
              >
                Open BRS Golf Portal &rarr;
              </a>
            </div>
          </div>

          {/* Card 3: Direct Reservations */}
          <div className="bg-[#0f0f0f] border border-white/10 p-6 rounded-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300 mb-4">
                <Phone size={22} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">
                Reservations Team
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                For groups of 5+ rooms, corporate outings, or tailored itineraries, our reservations team is available to assist.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
              <a
                href="tel:+353749155301"
                className="flex items-center justify-center gap-2 w-full text-center bg-white/5 hover:bg-white/10 text-white text-xs py-2.5 rounded-sm transition-colors"
              >
                <Phone size={14} className="text-[#DBB155]" />
                <span>+353 (0)74 91 55301</span>
              </a>
              <a
                href="mailto:reservations@rosapenna.ie"
                className="flex items-center justify-center gap-2 w-full text-center bg-white/5 hover:bg-white/10 text-gray-300 text-xs py-2.5 rounded-sm transition-colors"
              >
                <Mail size={14} className="text-[#DBB155]" />
                <span>reservations@rosapenna.ie</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
