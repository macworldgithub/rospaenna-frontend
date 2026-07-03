"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Golf",       href: "#golf"       },
  { label: "Stay",       href: "#stay"       },
  { label: "Dine",       href: "#dine"       },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact"    },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full absolute top-0 left-0 z-50">
      {/* Subtle top gradient so nav is readable over hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">

        <Link href="/" className="flex flex-col leading-none shrink-0">
          <span className="text-white font-bold tracking-[0.28em] uppercase text-[14px] md:text-[15px]">
            ROSAPENNA
          </span>
          <span className="text-[#DBB155] tracking-[0.18em] uppercase text-[8px] md:text-[9px] font-medium">
            HOTEL &amp; GOLF RESORT
          </span>
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/75 hover:text-white tracking-[0.18em] uppercase text-[11px] font-semibold transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right Buttons ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {/* Book Your Stay — outlined */}
          <Link
            href="#stay"
            className="px-4 py-2.5 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#DBB155] hover:text-black transition-all duration-200 whitespace-nowrap"
          >
            Book Your Stay
          </Link>

          {/* Phone */}
          <a
            href="tel:+35374915301"
            className="text-white/60 hover:text-white text-[11px] tracking-wide transition-colors whitespace-nowrap"
          >
            📞 +353 74 915 5301
          </a>

          {/* ── Book Golf ── navigates to /book-golf (course selection) ── */}
          <Link
            href="/book-golf"
            className="px-5 py-2.5 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#c9a04a] transition-all duration-200 shadow-md whitespace-nowrap"
          >
            Book Golf
          </Link>
        </div>

        {/* ── Mobile Hamburger ──────────────────────────── */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {open && (
        <div className="relative md:hidden bg-black/95 backdrop-blur-sm border-t border-[#DBB155]/20 px-6 py-6 flex flex-col gap-4">
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
              href="#stay"
              onClick={() => setOpen(false)}
              className="text-center py-3 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[11px] uppercase"
            >
              Book Your Stay
            </Link>
            {/* Mobile Book Golf → /book-golf (course selection) */}
            <Link
              href="/book-golf"
              onClick={() => setOpen(false)}
              className="text-center py-3 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[11px] uppercase"
            >
              Book Golf
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
