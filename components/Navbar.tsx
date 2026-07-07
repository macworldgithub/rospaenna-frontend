"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
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
          className="flex flex-col leading-none shrink-0 text-left"
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
            href="#packages"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#DBB155] hover:text-black transition-all duration-200 whitespace-nowrap"
          >
            Book Your Stay
          </Link>

          {/* Phone */}
          <a
            href="tel:+35374915301"
            className="text-white/60 hover:text-[#c9a04a] text-[11px] tracking-wide transition-colors whitespace-nowrap"
          >
            📞 +353 74 915 5301
          </a>
        
          <Link
            href="/book-golf"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#c9a04a] transition-all duration-200 shadow-md whitespace-nowrap"
          >
            Book Golf
          </Link>
        </div>

        {/* ── Mobile Hamburger ──────────────────────────── */}
        <button
          className="xl:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
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
              href="#packages"
              onClick={() => setOpen(false)}
              className="text-center py-3 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.15em] text-[11px] uppercase"
            >
              Book Your Stay
            </Link>
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
