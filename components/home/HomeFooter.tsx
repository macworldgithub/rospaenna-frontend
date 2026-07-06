"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const quickLinks = [
  { label: "Golf Courses", href: "#golf" },
  { label: "Accommodation", href: "#stay" },
  { label: "Dining", href: "#dine" },
  { label: "Package Builder", href: "#packages" },
  { label: "Resort Map", href: "#" },
  { label: "Gallery", href: "#" },
];

const courses = [
  { label: "St Patrick's Links", href: "#golf" },
  { label: "Sandy Hills Links", href: "#golf" },
  { label: "Old Tom Morris Links", href: "#golf" },
  { label: "Three Links Ticket", href: "#golf" },
  { label: "Tee Times", href: "#" },
  { label: "Green Fees", href: "#" },
];

export default function HomeFooter() {
  return (
    <footer
      id="contact"
      className="bg-[#050505] border-t border-[#1A1A1A] text-white scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Top */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 lg:gap-24">
          {/* Logo */}

          <div>
            <h2 className="font-serif text-2xl tracking-[0.18em] font-semibold">
              ROSAPENNA
            </h2>

            <p className="uppercase text-[#D4AF55] tracking-[0.35em] text-[12px] mt-3">
              Hotel & Golf Resort
            </p>

            <p className="text-[#9E9E9E] leading-6 mt-6 text-[14px]">
              Three championship links courses and luxury accommodation on the
              wild Atlantic coast of Donegal, Ireland. Established 1893.
            </p>

            <div className="flex gap-2 mt-4">
              <MapPin size={12} className="text-[#D4AF55] mt-1 shrink-0" />

              <p className="text-[#9E9E9E] leading-6 text-[14px]">
                Rosapenna, Downings,
                <br />
                Co. Donegal, F93 PN73, Ireland
              </p>
            </div>
          </div>

          {/* Quick Links */}

          <div>
            <h3 className="uppercase text-[#D4AF55] tracking-[0.35em] text-[11px] mb-8">
              Quick Links
            </h3>

            <ul className="space-y-5">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`transition text-[#A3A3A3] hover:text-[#D4AF55]`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}

          <div>
            <h3 className="uppercase text-[#D4AF55] tracking-[0.35em] text-[11px] mb-8">
              Our Courses
            </h3>

            <ul className="space-y-5">
              {courses.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#A3A3A3] hover:text-[#D4AF55] transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h3 className="uppercase text-[#D4AF55] tracking-[0.35em] text-[11px] mb-8">
              Contact
            </h3>

            <div>
              <p className="uppercase tracking-[0.25em] text-[10px] text-[#6F6F6F] mb-2">
                Hotel Reservations
              </p>

              <div className="flex gap-3 items-center text-white hover:text-[#D4AF55] mb-1 text-[14px]">
                <Phone size={16} className="text-[#9B9B9B]" />
                +353 (0)74 91 55301
              </div>

              <div className="flex gap-3 items-center text-white hover:text-[#D4AF55] text-[14px]">
                <Mail size={16} className="text-[#9B9B9B]" />
                reservations@rosapenna.ie
              </div>
            </div>

            <div className="mt-6">
              <p className="uppercase tracking-[0.25em] text-[10px] text-[#6F6F6F] mb-2">
                Golf Enquiries
              </p>

              <div className="flex gap-3 items-center text-white hover:text-[#D4AF55] mb-1 text-[14px]">
                <Phone size={16} className="text-[#9B9B9B]" />
                +353 (0)74 91 55000
              </div>

              <div className="flex gap-3 items-center text-white hover:text-[#D4AF55] text-[14px]">
                <Mail size={16} className="text-[#9B9B9B]" />
                golf@rosapenna.ie
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div className="border-t border-[#141414] mt-14 sm:mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#666] text-sm text-center md:text-left">
            © 2026 Rosapenna Hotel & Golf Resort. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            <Link
              href="#"
              className="text-[#666] hover:text-[#D4AF55] transition"
            >
              Privacy Policy
            </Link>

            <Link
              href="#"
              className="text-[#666] hover:text-[#D4AF55] transition"
            >
              Payment Policy
            </Link>

            <Link
              href="#"
              className="text-[#666] hover:text-[#D4AF55] transition"
            >
              Cookie Notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
