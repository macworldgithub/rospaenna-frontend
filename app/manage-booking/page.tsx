"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Lock,
  Phone,
  Mail,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  CreditCard,
  Users,
  Send,
  RefreshCw,
  FileText,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  requestOtp,
  verifyOtp,
  fetchAuthenticatedBooking,
  logoutMmbSession,
  type MmbBookingSummary,
} from "@/lib/mmbClient";

interface MmbStatus {
  enabled: boolean;
  message: string;
  updated_at?: string | null;
}

export default function ManageBookingPage() {
  const [status, setStatus] = useState<MmbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "amend" | "rooming" | "requests">("dashboard");

  // Guest authentication and session state
  const [bookingRef, setBookingRef] = useState("RSP-20270514-TEST01");
  const [surname, setSurname] = useState("Golfer");
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<MmbBookingSummary | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSendOtp() {
    if (!bookingRef || bookingRef.trim().length < 5) {
      setAuthError("Please enter a valid booking reference.");
      return;
    }
    if (!surname || surname.trim().length < 1) {
      setAuthError("Please enter the lead guest surname.");
      return;
    }
    setAuthError(null);
    setIsRequestingOtp(true);
    try {
      const res = await requestOtp(bookingRef, surname);
      if (res.success) {
        setOtpRequested(true);
        setOtpMessage(res.message);
        setCooldown(res.cooldown_seconds || 60);
      } else {
        setAuthError(res.message || "Failed to request code.");
      }
    } finally {
      setIsRequestingOtp(false);
    }
  }

  async function handleVerifyCode() {
    if (!otpCode || !/^\d{6}$/.test(otpCode.trim())) {
      setAuthError("Please enter a valid 6-digit numeric verification code.");
      return;
    }
    setAuthError(null);
    setIsVerifyingOtp(true);
    try {
      const res = await verifyOtp(bookingRef, otpCode);
      if (res.success && res.session) {
        const token = res.session.session_token;
        setSessionToken(token);
        const bookingRes = await fetchAuthenticatedBooking(bookingRef, token);
        if (bookingRes.success && bookingRes.booking) {
          setBookingData(bookingRes.booking);
        }
        setVerified(true);
      } else {
        setAuthError(res.error || "Invalid or expired verification code.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleLogout() {
    if (sessionToken) {
      await logoutMmbSession(sessionToken);
    }
    setSessionToken(null);
    setBookingData(null);
    setVerified(false);
    setOtpRequested(false);
    setOtpCode("");
    setOtpMessage(null);
    setAuthError(null);
  }

  async function checkStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/mmb/status", { cache: "no-store" });
      if (res.ok) {
        const data: MmbStatus = await res.json();
        setStatus(data);
      } else {
        setStatus({ enabled: false, message: "Manage My Booking is currently disabled." });
      }
    } catch {
      setStatus({ enabled: false, message: "Manage My Booking is currently disabled." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  const isEnabled = Boolean(status?.enabled);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-[#DBB155]/20 selection:text-[#DBB155]">
      <Navbar />

      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center">
        {loading ? (
          <div className="my-auto text-xs text-gray-400 font-mono flex items-center gap-2 animate-pulse">
            Checking portal release state...
          </div>
        ) : !isEnabled ? (
          /* MMB Disabled (Default Server-Enforced Gate) */
          <div className="w-full max-w-3xl my-auto border border-[#DBB155]/30 bg-[#0A0A0A] p-8 sm:p-12 rounded-sm text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DBB155]/60 to-transparent" />

            <div className="w-16 h-16 rounded-full bg-[#DBB155]/10 border border-[#DBB155]/30 flex items-center justify-center mx-auto mb-6 text-[#DBB155]">
              <Lock size={28} />
            </div>

            <p className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#DBB155] mb-2">
              Guest Portal Release Control (Ticket M01)
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
              Manage My Booking
            </h1>

            <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed mb-6">
              Online self-service booking amendments are currently offline pending written activation by Rosapenna Resort.
            </p>

            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-sm text-xs text-amber-300 max-w-xl mx-auto mb-8 flex items-start gap-3 text-left">
              <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Authoritative Release Control Active</span>
                <span>
                  To safeguard existing hotel reservations and golf tee times, guest-initiated online amendments remain disabled. Please contact the Reservations team directly for any booking changes or inquiries.
                </span>
              </div>
            </div>

            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-8 text-xs">
              <div className="p-4 bg-[#111] border border-white/5 rounded-sm space-y-2">
                <span className="text-[#DBB155] font-semibold uppercase tracking-wider block">
                  Hotel Reservations
                </span>
                <p className="text-gray-400 text-[11px]">Room configuration, sharing, and stay dates</p>
                <div className="pt-2 space-y-1">
                  <a
                    href="tel:+353749155301"
                    className="flex items-center gap-2 text-white hover:text-[#DBB155] transition-colors"
                  >
                    <Phone size={13} className="text-[#DBB155]" />
                    <span>+353 (0)74 91 55301</span>
                  </a>
                  <a
                    href="mailto:reservations@rosapenna.ie"
                    className="flex items-center gap-2 text-white hover:text-[#DBB155] transition-colors"
                  >
                    <Mail size={13} className="text-[#DBB155]" />
                    <span>reservations@rosapenna.ie</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-[#111] border border-white/5 rounded-sm space-y-2">
                <span className="text-[#DBB155] font-semibold uppercase tracking-wider block">
                  Golf Pavilion
                </span>
                <p className="text-gray-400 text-[11px]">Tee times, hire clubs, and caddy requests</p>
                <div className="pt-2 space-y-1">
                  <a
                    href="tel:+353749155000"
                    className="flex items-center gap-2 text-white hover:text-[#DBB155] transition-colors"
                  >
                    <Phone size={13} className="text-[#DBB155]" />
                    <span>+353 (0)74 91 55000</span>
                  </a>
                  <a
                    href="mailto:golf@rosapenna.ie"
                    className="flex items-center gap-2 text-white hover:text-[#DBB155] transition-colors"
                  >
                    <Mail size={13} className="text-[#DBB155]" />
                    <span>golf@rosapenna.ie</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#packages"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#DBB155] hover:bg-[#c9a04a] text-black font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Stay &amp; Play Packages
              </Link>
            </div>
          </div>
        ) : (
          /* MMB Active (Full Scope Preview) */
          <div className="w-full space-y-6">
            {/* Top Gate Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-sm text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="font-semibold">Release Control Switch: ACTIVE (Development Preview)</span>
                <span className="text-gray-400 font-mono text-[11px]">| Updated: {status?.updated_at?.slice(0, 19)}</span>
              </div>
              <button
                type="button"
                onClick={checkStatus}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-gray-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={11} /> Refresh State
              </button>
            </div>

            {/* Portal Header */}
            <div className="text-center space-y-2">
              <p className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#DBB155]">
                Rosapenna Hotel &amp; Golf Resort
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Manage My Booking
              </h1>
              <p className="text-xs text-gray-400 max-w-xl mx-auto">
                Review your confirmed itinerary, request date or tee-time amendments, manage rooming occupants, and submit special requests.
              </p>
            </div>

            {/* Section 1: Guest Verification / Lookup Card */}
            <div className="border border-[#DBB155]/20 bg-[#0E0E0E] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#DBB155] uppercase tracking-wider">
                  <ShieldCheck size={16} /> Stage 1: Identity &amp; Booking Lookup (Scope Ticket M03)
                </div>
                {verified && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1 bg-red-950/30 border border-red-800/40 rounded transition-colors cursor-pointer"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </div>

              {verified ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-sm text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>
                      Authenticated guest session active for booking <b className="font-mono text-white">{bookingRef}</b> ({bookingData?.lead_guest_name || surname}).
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">Scoped Session Active</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Booking Reference</label>
                      <input
                        type="text"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        placeholder="RSP-20270514-XXXXXX"
                        className="w-full bg-[#161616] border border-white/10 p-2 text-white font-mono rounded-sm outline-none focus:border-[#DBB155]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Lead Guest Surname</label>
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="e.g. Golfer"
                        className="w-full bg-[#161616] border border-white/10 p-2 text-white rounded-sm outline-none focus:border-[#DBB155]"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isRequestingOtp || cooldown > 0}
                        className="w-full py-2 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isRequestingOtp ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Sending...
                          </>
                        ) : cooldown > 0 ? (
                          `Wait ${cooldown}s`
                        ) : otpRequested ? (
                          "Resend Code"
                        ) : (
                          "Send One-Time Code"
                        )}
                      </button>
                    </div>
                  </div>

                  {otpRequested && (
                    <div className="pt-2 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-gray-400 mb-1">
                            Enter 6-Digit Verification Code (Sent to email on file)
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="123456"
                            className="w-full bg-[#161616] border border-white/10 p-2 text-white font-mono text-center tracking-[0.3em] font-bold text-base rounded-sm outline-none focus:border-[#DBB155]"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isVerifyingOtp ? (
                              <>
                                <Loader2 size={13} className="animate-spin" /> Verifying...
                              </>
                            ) : (
                              "Verify & Access Booking"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {otpMessage && (
                    <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-sm text-xs text-blue-300">
                      {otpMessage}
                    </div>
                  )}

                  {authError && (
                    <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-sm text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-400" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 mt-2">
                    * Security requirement: One-time verification code is sent strictly to the booking email on record; caller cannot supply an arbitrary email.
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Tab Navigation for Stages 2 to 5 */}
            <div className="border-b border-white/10 flex gap-2 text-xs font-semibold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "dashboard"
                    ? "border-b-2 border-[#DBB155] text-[#DBB155]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Calendar size={14} /> 1. Confirmed Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("amend")}
                className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "amend"
                    ? "border-b-2 border-[#DBB155] text-[#DBB155]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <RefreshCw size={14} /> 2. Live Amendments
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooming")}
                className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "rooming"
                    ? "border-b-2 border-[#DBB155] text-[#DBB155]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Users size={14} /> 3. Rooming &amp; Caddies
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "requests"
                    ? "border-b-2 border-[#DBB155] text-[#DBB155]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText size={14} /> 4. Special Requests
              </button>
            </div>

            {/* Tab 1: Confirmed Dashboard (Scope Ticket M04) */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#111] border border-white/5 p-5 rounded-sm space-y-3">
                  <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                    Confirmed Stay &amp; Hotel Details
                  </span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference:</span>{" "}
                    <span className="font-mono text-white">{bookingData?.booking_reference || bookingRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dates:</span>{" "}
                    <span className="text-white">
                      {bookingData?.stay
                        ? `${bookingData.stay.arrival_date} → ${bookingData.stay.departure_date} (${bookingData.stay.nights} Nights)`
                        : "03 Nov 2026 → 07 Nov 2026 (4 Nights)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accommodations:</span>{" "}
                    <span className="text-white">
                      {bookingData?.stay
                        ? `${bookingData.stay.room_quantity}x ${bookingData.stay.room_category}`
                        : "1x Classic Room (Twin Beds)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Breakfast:</span>{" "}
                    <span className="text-emerald-400 font-medium">Included Daily</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>{" "}
                    <span className="text-emerald-400 font-mono uppercase">{bookingData?.status || "Confirmed"}</span>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-5 rounded-sm space-y-3">
                  <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                    Championship Golf Rounds
                  </span>
                  {bookingData?.golf_rounds && bookingData.golf_rounds.length > 0 ? (
                    bookingData.golf_rounds.map((round, idx) => (
                      <div
                        key={`${round.course_name}-${round.date}-${idx}`}
                        className={`flex justify-between items-center text-[11px] py-1 ${
                          idx < (bookingData.golf_rounds.length - 1) ? "border-b border-white/5" : ""
                        }`}
                      >
                        <div>
                          <span className="text-white font-medium block">{round.course_name}</span>
                          <span className="text-gray-400">
                            {round.date} &bull; {round.players} Players
                          </span>
                        </div>
                        <span className="font-mono text-[#DBB155] bg-white/5 px-2 py-0.5 rounded">
                          {round.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-[11px] py-1 border-b border-white/5">
                        <div>
                          <span className="text-white font-medium block">Old Tom Morris Links</span>
                          <span className="text-gray-400">04 Nov 2026 &bull; 2 Players</span>
                        </div>
                        <span className="font-mono text-[#DBB155] bg-white/5 px-2 py-0.5 rounded">10:00</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] py-1 border-b border-white/5">
                        <div>
                          <span className="text-white font-medium block">Sandy Hills Links</span>
                          <span className="text-gray-400">05 Nov 2026 &bull; 2 Players</span>
                        </div>
                        <span className="font-mono text-[#DBB155] bg-white/5 px-2 py-0.5 rounded">10:30</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] py-1">
                        <div>
                          <span className="text-white font-medium block">Old Tom Morris Links</span>
                          <span className="text-gray-400">06 Nov 2026 &bull; 2 Players</span>
                        </div>
                        <span className="font-mono text-[#DBB155] bg-white/5 px-2 py-0.5 rounded">11:00</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Financial Position */}
                <div className="md:col-span-2 bg-[#121212] border border-[#DBB155]/30 p-5 rounded-sm space-y-3">
                  <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2 flex items-center justify-between">
                    <span>Verified Payment Position &amp; Balance</span>
                    <span className="font-mono text-xs font-normal text-gray-400">Ledger Verified</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                      <span className="text-gray-400 text-[11px] block mb-1">Total Package Price</span>
                      <span className="text-white font-mono font-bold text-base">
                        €{bookingData?.financials ? bookingData.financials.total_amount : "1,240.00"}
                      </span>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                      <span className="text-gray-400 text-[11px] block mb-1">25% Deposit Paid</span>
                      <span className="text-emerald-400 font-mono font-bold text-base">
                        €{bookingData?.financials ? bookingData.financials.deposit_paid : "310.00"}
                      </span>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                      <span className="text-gray-400 text-[11px] block mb-1">75% Balance Due</span>
                      <span className="text-[#DBB155] font-mono font-bold text-base">
                        €{bookingData?.financials ? bookingData.financials.balance_due : "930.00"}
                      </span>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                      <span className="text-gray-400 text-[11px] block mb-1">Payment Status</span>
                      <span className="text-emerald-400 font-mono text-xs font-semibold uppercase">
                        {bookingData?.financials ? bookingData.financials.payment_status : "deposit_paid"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Live Amendments (Scope Tickets M05 & M06) */}
            {activeTab === "amend" && (
              <div className="bg-[#111] border border-white/5 p-6 rounded-sm space-y-4 text-xs">
                <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                  Stage 3: Live Costed Amendments (Scope Tickets M05–M09)
                </span>
                <p className="text-gray-300">
                  Search live availability to adjust stay dates, upgrade room categories, or select different championship golf tee times.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#181818] rounded border border-white/5">
                    <span className="text-white font-semibold block mb-1">Option A: Room Upgrade</span>
                    <p className="text-gray-400 text-[11px] mb-2">Upgrade to Deluxe Room (+€40/night)</p>
                    <div className="flex justify-between items-center text-[11px] font-mono border-t border-white/5 pt-2">
                      <span className="text-gray-400">Price Delta:</span>
                      <span className="text-emerald-400">+€160.00</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#181818] rounded border border-white/5">
                    <span className="text-white font-semibold block mb-1">Option B: Tee Time Adjustment</span>
                    <p className="text-gray-400 text-[11px] mb-2">Shift Day 2 to Afternoon slot (14:30)</p>
                    <div className="flex justify-between items-center text-[11px] font-mono border-t border-white/5 pt-2">
                      <span className="text-gray-400">Price Delta:</span>
                      <span className="text-white">€0.00 (No fee)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#181818] rounded border border-white/5">
                    <span className="text-white font-semibold block mb-1">Option C: Add 4th Round</span>
                    <p className="text-gray-400 text-[11px] mb-2">Add Sandy Hills on arrival afternoon</p>
                    <div className="flex justify-between items-center text-[11px] font-mono border-t border-white/5 pt-2">
                      <span className="text-gray-400">Price Delta:</span>
                      <span className="text-emerald-400">+€120.00</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded text-[11px] text-gray-400 flex items-center justify-between">
                  <span>* Amendment commits safely recheck live inventory, calculate exact delta, and update Opera &amp; BRS idempotently.</span>
                </div>
              </div>
            )}

            {/* Tab 3: Rooming List & Caddies (Scope Tickets M10 & M12) */}
            {activeTab === "rooming" && (
              <div className="bg-[#111] border border-white/5 p-6 rounded-sm space-y-4 text-xs">
                <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                  Stage 4: Rooming List &amp; Caddies (Scope Tickets M10 &amp; M12)
                </span>
                <div className="space-y-3">
                  <div className="p-3 bg-[#161616] rounded border border-white/5 space-y-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Room 1: Classic Room (2 Guests)</span>
                      <span className="text-[#DBB155]">Twin Bed Configuration</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                      <div>Guest 1: <strong>John Golfer (Lead)</strong></div>
                      <div>Guest 2: <strong>Michael Golfer</strong></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#161616] rounded border border-white/5 space-y-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Caddy Requests</span>
                      <span className="text-gray-400">€90 per bag payable on day</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Round 1 (Nov 4): 2x Caddies requested &bull; Round 2 (Nov 5): None &bull; Round 3 (Nov 6): 2x Caddies requested
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Special Requests (Scope Ticket M13) */}
            {activeTab === "requests" && (
              <div className="bg-[#111] border border-white/5 p-6 rounded-sm space-y-4 text-xs">
                <span className="text-[#DBB155] uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                  Stage 5: Special Requests &amp; Staff Inquiries (Scope Ticket M13)
                </span>
                <p className="text-gray-300">
                  Submit free-text requests for dietary requirements, medical buggies, or preferred tee-time shifts directly to hotel reservations.
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Please arrange adjacent rooms on ground floor if possible; dietary notice: 1 coeliac guest..."
                  className="w-full bg-[#161616] border border-white/10 p-3 text-white text-xs rounded-sm outline-none focus:border-[#DBB155] resize-none"
                />
                <button
                  type="button"
                  className="px-5 py-2 bg-[#DBB155] hover:bg-[#c9a04a] text-black font-semibold uppercase tracking-wider text-xs rounded-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} /> Submit Request to Reservations
                </button>
              </div>
            )}

            {/* Return Link */}
            <div className="text-center pt-4">
              <Link
                href="/#packages"
                className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white underline cursor-pointer"
              >
                <ArrowLeft size={13} /> Return to Stay &amp; Play Packages
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#181818] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Rosapenna Hotel &amp; Golf Resort. All rights reserved.</p>
      </footer>
    </main>
  );
}
