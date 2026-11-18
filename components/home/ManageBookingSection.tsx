"use client";

import Link from "next/link";
import { useManageBookingEnabled } from "@/lib/useManageBookingEnabled";

export default function ManageBookingSection() {
  const enabled = useManageBookingEnabled();
  if (!enabled) return null;

  return (
    <section aria-labelledby="manage-booking-heading" className="border-y border-white/10 bg-[#0c0c0c] px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="manage-booking-heading" className="font-serif text-xl text-[#DBB155]">Already have a booking?</h2>
          <p className="mt-1 text-sm text-gray-300">Use your booking reference to view your itinerary or request a change.</p>
        </div>
        <Link href="/manage-booking" className="rounded-sm border border-[#DBB155] px-4 py-2 text-sm font-semibold text-[#DBB155] hover:bg-[#DBB155] hover:text-black">
          Manage My Booking
        </Link>
      </div>
    </section>
  );
}
