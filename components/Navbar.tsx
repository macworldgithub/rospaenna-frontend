"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone, Mail, Calendar, Compass } from "lucide-react";
import BookingChoiceModal from "@/components/booking/BookingChoiceModal";

const navLinks = [
  { label: "Golf", href: "#golf" },
  { label: "Stay", href: "#stay" },
  { label: "Dine", href: "#dine" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        aria-label="Main Navigation"
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#050505]/95 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
            : "bg-transparent"
        }`}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />

        <div className="relative max-w-350 mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col leading-none shrink-0 text-left focus:outline-none"
            aria-label="Rosapenna Hotel & Golf Resort - Back to Top"
          >
            <span className="text-white font-bold tracking-[0.28em] uppercase text-[14px] md:text-[15px]">
              ROSAPENNA
            </span>
            <span className="text-[#DBB155] tracking-[0.18em] uppercase text-[8px] md:text-[10px] mt-2 font-medium">
              HOTEL &amp; GOLF RESORT
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-4 lg:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/75 hover:text-[#c9a04a] tracking-[0.18em] uppercase text-[11px] font-semibold transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Buttons ─────────────────────────────── */}
          <div className="hidden xl:flex items-center gap-2 lg:gap-3">
            {/* Book Your Stay — outlined */}
            <Link
              href="/#packages"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#DBB155] hover:text-black transition-all duration-200 whitespace-nowrap"
            >
              Book Your Stay
            </Link>

            {/* Direct Reservations Call */}
            <a
              href="tel:+353749155301"
              aria-label="Call Reservations at +353 (0)74 91 55301"
              className="text-white/75 hover:text-[#c9a04a] text-[11px] tracking-wide transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Phone size={13} className="text-[#DBB155]" />
              <span>+353 (0)74 91 55301</span>
            </a>

            {/* Booking Choice Trigger */}
            <button
              type="button"
              onClick={() => setChoiceOpen(true)}
              className="px-5 py-2.5 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#c9a04a] transition-all duration-200 shadow-md whitespace-nowrap cursor-pointer"
            >
              Book Options
            </button>
          </div>

          {/* ── Mobile Hamburger ──────────────────────────── */}
          <button
            className="xl:hidden text-white p-1 focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="relative xl:hidden bg-black/95 backdrop-blur-sm border-t border-[#DBB155]/20 px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-[#DBB155] tracking-[0.15em] uppercase text-[13px] font-semibold transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-4 border-t border-[#DBB155]/20">
              <Link
                href="/#packages"
                onClick={() => setOpen(false)}
                className="text-center py-3 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[11px] uppercase flex items-center justify-center gap-2"
              >
                <Calendar size={14} />
                Book Stay &amp; Play
              </Link>

              <a
                href="https://visitors.brsgolf.com/rosapenna#/course/1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-center py-3 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[11px] uppercase flex items-center justify-center gap-2"
              >
                <Compass size={14} />
                Book Golf Only (BRS)
              </a>

              {/* Mobile Contact Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="tel:+353749155301"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 text-white text-[11px] font-medium rounded-sm"
                  aria-label="Call Hotel Reservations"
                >
                  <Phone size={13} className="text-[#DBB155]" />
                  Call Hotel
                </a>
                <a
                  href="mailto:reservations@rosapenna.ie"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 text-white text-[11px] font-medium rounded-sm"
                  aria-label="Email Hotel Reservations"
                >
                  <Mail size={13} className="text-[#DBB155]" />
                  Email Hotel
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Choice Modal */}
      <BookingChoiceModal isOpen={choiceOpen} onClose={() => setChoiceOpen(false)} />
    </>
  );
}
