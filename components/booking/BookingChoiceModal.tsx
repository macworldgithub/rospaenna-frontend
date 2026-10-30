"use client";

import Link from "next/link";
import { Phone, Mail, Calendar, Compass, X } from "lucide-react";

interface BookingChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingChoiceModal({ isOpen, onClose }: BookingChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-choice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-[#DBB155]/40 p-6 sm:p-8 rounded-sm shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close booking choice dialog"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <p className="text-[#DBB155] uppercase tracking-[0.25em] text-[10px] font-semibold mb-2">
            Rosapenna Hotel &amp; Golf Resort
          </p>
          <h2 id="booking-choice-title" className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Choose Your Booking Experience
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Select your preferred journey below to explore stay packages, visitor tee times, or contact our reservations team.
          </p>
        </div>

        {/* 3 Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Choice 1: Stay & Play */}
          <Link
            href="/#packages"
            onClick={onClose}
            className="flex flex-col justify-between p-5 bg-[#141414] border border-[#DBB155]/20 hover:border-[#DBB155] rounded-sm transition-all duration-200 group text-left"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#DBB155]/10 flex items-center justify-center text-[#DBB155] mb-3 group-hover:bg-[#DBB155] group-hover:text-black transition-colors">
                <Calendar size={18} />
              </div>
              <h3 className="text-base font-serif font-semibold text-white group-hover:text-[#DBB155] transition-colors">
                Stay &amp; Play
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Resort accommodation combined with championship links golf at exclusive package rates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#DBB155] uppercase tracking-wider flex items-center gap-1">
              Build Package &rarr;
            </div>
          </Link>

          {/* Choice 2: Golf Only */}
          <a
            href="https://visitors.brsgolf.com/rosapenna#/course/1"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex flex-col justify-between p-5 bg-[#141414] border border-white/10 hover:border-[#DBB155] rounded-sm transition-all duration-200 group text-left"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 mb-3 group-hover:bg-[#DBB155] group-hover:text-black transition-colors">
                <Compass size={18} />
              </div>
              <h3 className="text-base font-serif font-semibold text-white group-hover:text-[#DBB155] transition-colors">
                Golf Only
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Day visitor tee times on Old Tom Morris, Sandy Hills, or St Patrick&apos;s Links via BRS Golf.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-bold text-[#DBB155] uppercase tracking-wider flex items-center gap-1">
              Visit BRS Golf &rarr;
            </div>
          </a>

          {/* Choice 3: Direct Reservations */}
          <div className="flex flex-col justify-between p-5 bg-[#141414] border border-white/10 rounded-sm text-left">
            <div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 mb-3">
                <Phone size={18} />
              </div>
              <h3 className="text-base font-serif font-semibold text-white">
                Reservations
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Bespoke itineraries, large groups (5+ rooms), or custom assistance from our team.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
              <a
                href="tel:+353749155301"
                className="text-xs text-[#DBB155] hover:underline flex items-center gap-1.5 font-medium"
              >
                <Phone size={12} /> +353 (0)74 91 55301
              </a>
              <a
                href="mailto:reservations@rosapenna.ie"
                className="text-xs text-gray-300 hover:text-[#DBB155] flex items-center gap-1.5"
              >
                <Mail size={12} /> Email Hotel
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-[11px] text-gray-500">
            Golf Enquiries: <a href="tel:+353749155000" className="text-gray-400 hover:text-[#DBB155] underline">+353 (0)74 91 55000</a> | <a href="mailto:golf@rosapenna.ie" className="text-gray-400 hover:text-[#DBB155] underline">golf@rosapenna.ie</a>
          </p>
        </div>
      </div>
    </div>
  );
}
