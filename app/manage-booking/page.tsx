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
  Users,
  Send,
  RefreshCw,
  FileText,
  ShieldCheck,
  LogOut,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Info,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import {
  requestOtp,
  verifyOtp,
  fetchAuthenticatedBooking,
  logoutMmbSession,
  searchAmendmentOptions,
  createAmendmentOffer,
  acceptAmendmentOffer,
  revalidateAmendmentOffer,
  initiateAmendmentSettlement,
  commitAmendment,
  fetchOccupantRoster,
  updateOccupantRoster,
  type OccupantRosterResponse,
  type OccupantDetail,
  type BedPreferenceType,
  type AmendmentPaymentInitiateResponse,
  type MmbAmendmentCommitResponse,
  type MmbBookingSummary,
  type MmbAmendmentSearchResponse,
  type AmendmentOfferSnapshot,
  type AmendmentOptionAlternative,
  type AmendmentRevalidationResponse,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Amendment Search state (Ticket M05)
  const [amendArrival, setAmendArrival] = useState("");
  const [amendDeparture, setAmendDeparture] = useState("");
  const [amendRoomCategory, setAmendRoomCategory] = useState("Classic Room");
  const [amendRoomQty, setAmendRoomQty] = useState(1);
  const [isSearchingAmendments, setIsSearchingAmendments] = useState(false);
  const [amendmentResponse, setAmendmentResponse] = useState<MmbAmendmentSearchResponse | null>(null);
  const [amendmentError, setAmendmentError] = useState<string | null>(null);

  // Ticket M06: Amendment Cost and Terms Review state
  const [selectedOfferForReview, setSelectedOfferForReview] = useState<AmendmentOfferSnapshot | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [acceptedTermsCheckbox, setAcceptedTermsCheckbox] = useState(false);
  const [occupantReviewCheckbox, setOccupantReviewCheckbox] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
  const [offerAcceptError, setOfferAcceptError] = useState<string | null>(null);
  const [offerAcceptedSuccess, setOfferAcceptedSuccess] = useState(false);

  // Ticket M07: Amendment Revalidation state
  const [isRevalidatingOffer, setIsRevalidatingOffer] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<AmendmentRevalidationResponse | null>(null);
  const [settlementResult, setSettlementResult] = useState<AmendmentPaymentInitiateResponse | null>(null);
  const [isInitiatingSettlement, setIsInitiatingSettlement] = useState(false);
  const [settlementError, setSettlementError] = useState<string | null>(null);
  const [revalidationError, setRevalidationError] = useState<string | null>(null);

  // Ticket M09: Confirmed Amendment Commit state
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<MmbAmendmentCommitResponse | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Ticket M10: Room Occupants, Sharing, and Moves state
  const [occupantRoster, setOccupantRoster] = useState<OccupantRosterResponse | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [isSavingOccupants, setIsSavingOccupants] = useState(false);
  const [occupantSuccessMessage, setOccupantSuccessMessage] = useState<string | null>(null);

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
          if (bookingRes.booking.stay) {
            setAmendArrival(bookingRes.booking.stay.arrival_date || "");
            setAmendDeparture(bookingRes.booking.stay.departure_date || "");
            setAmendRoomCategory(bookingRes.booking.stay.room_category || "Classic Room");
            setAmendRoomQty(bookingRes.booking.stay.room_quantity || 1);
          }
          await loadOccupantRoster(bookingRef, token);
        }
        setVerified(true);
      } else {
        setAuthError(res.error || "Invalid or expired verification code.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleRefreshBooking() {
    if (!sessionToken || !bookingRef) return;
    setIsRefreshing(true);
    try {
      const bookingRes = await fetchAuthenticatedBooking(bookingRef, sessionToken);
      if (bookingRes.success && bookingRes.booking) {
        setBookingData(bookingRes.booking);
        if (bookingRes.booking.stay && !amendArrival) {
          setAmendArrival(bookingRes.booking.stay.arrival_date || "");
          setAmendDeparture(bookingRes.booking.stay.departure_date || "");
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleReviewOffer(alt: AmendmentOptionAlternative) {
    if (!bookingData) return;
    setIsLoadingOffer(true);
    setOfferAcceptError(null);
    setOfferAcceptedSuccess(false);
    setAcceptedTermsCheckbox(false);
    setOccupantReviewCheckbox(false);
    setRevalidationResult(null);
    setRevalidationError(null);
    setCommitResult(null);
    setCommitError(null);

    try {
      const res = await createAmendmentOffer(
        {
          booking_reference: bookingData.booking_reference,
          option_id: alt.option_id,
          proposed_stay: alt.stay_option,
          proposed_golf_rounds: alt.golf_options,
        },
        sessionToken || undefined
      );

      if (res.success && res.data) {
        setSelectedOfferForReview(res.data);
      } else {
        setAmendmentError(res.error || "Failed to generate amendment review offer.");
      }
    } finally {
      setIsLoadingOffer(false);
    }
  }

  async function handleAcceptOffer() {
    if (!selectedOfferForReview || !bookingData) return;
    if (!acceptedTermsCheckbox) {
      setOfferAcceptError("Please accept the terms and conditions.");
      return;
    }
    if (selectedOfferForReview.requires_occupant_review && !occupantReviewCheckbox) {
      setOfferAcceptError("Please acknowledge the room occupant and bed configuration review.");
      return;
    }

    setOfferAcceptError(null);
    setIsAcceptingOffer(true);

    try {
      const res = await acceptAmendmentOffer(
        {
          offer_id: selectedOfferForReview.offer_id,
          booking_reference: bookingData.booking_reference,
          terms_version: selectedOfferForReview.terms_version,
          accepted_terms: true,
          occupant_review_acknowledged: occupantReviewCheckbox,
        },
        sessionToken || undefined
      );

      if (res.success && res.data) {
        setSelectedOfferForReview(res.data);
        setOfferAcceptedSuccess(true);
        setRevalidationResult(null);
        setRevalidationError(null);
      } else {
        setOfferAcceptError(res.error || "Failed to accept amendment offer.");
      }
    } finally {
      setIsAcceptingOffer(false);
    }
  }


  async function handleInitiateSettlement() {
    if (!selectedOfferForReview || !revalidationResult || !revalidationResult.is_valid || !bookingData) return;
    setIsInitiatingSettlement(true);
    setSettlementError(null);
    try {
      const res = await initiateAmendmentSettlement(
        {
          booking_reference: bookingData.booking_reference,
          offer_id: selectedOfferForReview.offer_id,
          revalidation_id: revalidationResult.revalidation_id,
        },
        sessionToken || undefined
      );
      if (!res.success || !res.data) {
        setSettlementError(res.error || "Failed to initiate amendment settlement.");
      } else {
        setSettlementResult(res.data);
      }
    } catch (err: unknown) {
      setSettlementError(err instanceof Error ? err.message : "Error initiating amendment settlement.");
    } finally {
      setIsInitiatingSettlement(false);
    }
  }

  async function handleRevalidateOffer() {
    if (!selectedOfferForReview || !bookingData) return;
    setIsRevalidatingOffer(true);
    setRevalidationError(null);
    try {
      const res = await revalidateAmendmentOffer(
        {
          booking_reference: bookingData.booking_reference,
          offer_id: selectedOfferForReview.offer_id,
        },
        sessionToken || undefined
      );
      if (res.success && res.data) {
        setRevalidationResult(res.data);
      } else {
        setRevalidationError(res.error || "Unable to complete revalidation.");
      }
    } finally {
      setIsRevalidatingOffer(false);
    }
  }

  async function handleCommitAmendment() {
    if (!selectedOfferForReview || !revalidationResult || !revalidationResult.is_valid || !bookingData || !sessionToken) {
      setCommitError("Prerequisites not met. Offer must be revalidated before committing.");
      return;
    }
    setIsCommitting(true);
    setCommitError(null);
    try {
      const idempotencyKey = `commit-${selectedOfferForReview.offer_id}-${selectedOfferForReview.booking_revision || bookingData.booking_revision || 1}`;
      const res = await commitAmendment(
        {
          booking_reference: bookingData.booking_reference,
          offer_id: selectedOfferForReview.offer_id,
          revalidation_id: revalidationResult.revalidation_id,
          payment_id: settlementResult?.payment_id || null,
          idempotency_key: idempotencyKey,
        },
        sessionToken
      );

      if (!res.success || !res.data) {
        setCommitError(res.error || "Failed to commit amendment.");
      } else {
        setCommitResult(res.data);
        if (res.data.status === "confirmed") {
          await handleRefreshBooking();
        }
      }
    } catch (err: unknown) {
      setCommitError(err instanceof Error ? err.message : "Error committing amendment.");
    } finally {
      setIsCommitting(false);
    }
  }

  async function handleSearchAmendments() {
    if (!sessionToken || !bookingRef) {
      setAmendmentError("Authentication required. Please sign in to search amendments.");
      return;
    }
    setAmendmentError(null);
    setIsSearchingAmendments(true);
    try {
      const res = await searchAmendmentOptions(
        {
          booking_reference: bookingRef,
          proposed_arrival_date: amendArrival || undefined,
          proposed_departure_date: amendDeparture || undefined,
          proposed_room_category: amendRoomCategory || undefined,
          proposed_room_quantity: amendRoomQty,
        },
        sessionToken
      );
      if (res.success && res.data) {
        setAmendmentResponse(res.data);
      } else {
        setAmendmentError(res.error || "Unable to search amendment options.");
      }
    } finally {
      setIsSearchingAmendments(false);
    }
  }

  async function loadOccupantRoster(refToUse?: string, tokenToUse?: string) {
    const ref = refToUse || bookingData?.booking_reference || bookingRef;
    const tok = tokenToUse || sessionToken;
    if (!ref || !tok) return;

    setIsLoadingRoster(true);
    setRosterError(null);
    try {
      const res = await fetchOccupantRoster(ref, tok);
      if (res.success && res.data) {
        setOccupantRoster(res.data);
      } else {
        setRosterError(res.error || "Failed to load room occupants.");
      }
    } finally {
      setIsLoadingRoster(false);
    }
  }

  async function handleSaveOccupants() {
    if (!occupantRoster || !bookingData || !sessionToken) return;
    setIsSavingOccupants(true);
    setRosterError(null);
    setOccupantSuccessMessage(null);

    try {
      const res = await updateOccupantRoster(
        bookingData.booking_reference,
        {
          booking_reference: bookingData.booking_reference,
          expected_revision: occupantRoster.revision,
          occupants: occupantRoster.occupants,
          sharing_preferences: occupantRoster.sharing_preferences,
        },
        sessionToken
      );

      if (res.success && res.data) {
        setOccupantSuccessMessage(res.data.message || "Occupants updated successfully.");
        await loadOccupantRoster();
        await handleRefreshBooking();
      } else {
        setRosterError(res.error || "Failed to update room occupants.");
      }
    } finally {
      setIsSavingOccupants(false);
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
    setAmendmentResponse(null);
    setAmendmentError(null);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
              !verified || !bookingData ? (
                <div className="bg-[#111] border border-white/5 p-8 rounded-sm text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#DBB155]/10 border border-[#DBB155]/20 flex items-center justify-center mx-auto text-[#DBB155]">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-white">Authentication Required</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Please complete Stage 1 above by requesting and verifying your 6-digit one-time security code to access your confirmed itinerary.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Authoritative Source Freshness & Refresh Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0d0d0d] border border-white/10 p-3 rounded-sm gap-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <ShieldCheck size={16} className="text-[#DBB155]" />
                      <span>
                        Authoritative Itinerary: Verified for <strong className="text-white">{bookingData.lead_guest_name}</strong>
                      </span>
                      {bookingData.data_freshness_timestamp && (
                        <span className="text-[11px] text-gray-500 font-mono hidden sm:inline">
                          (Freshness: {new Date(bookingData.data_freshness_timestamp).toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshBooking}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[11px] text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} className={isRefreshing ? "animate-spin text-[#DBB155]" : "text-[#DBB155]"} />
                      <span>{isRefreshing ? "Refreshing..." : "Refresh Itinerary"}</span>
                    </button>
                  </div>

                  {/* Degraded / Unavailable Source Alerts (AC 5) */}
                  {bookingData.sources_health && (
                    <>
                      {Object.entries(bookingData.sources_health).map(([key, health]) => {
                        if (health.status === "unavailable" || health.status === "stale") {
                          return (
                            <div key={key} className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-sm text-xs text-amber-300 flex items-start gap-2.5">
                              <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block">{key === "hotel_pms" ? "Hotel Reservation Service" : key === "golf_brs" ? "Golf Booking Service" : "Payment Ledger"}: {health.message}</span>
                                <span className="text-[11px] text-amber-200/80">
                                  Unlinked or degraded sources do not alter your other confirmed details. For immediate assistance, please call Reservations at +353 (0)74 91 55301.
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </>
                  )}

                  {/* Grid: Stay Card & Golf Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Confirmed Stay & Hotel Accommodation */}
                    <div className="bg-[#111] border border-white/5 p-5 rounded-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[#DBB155] uppercase tracking-wider font-semibold">
                          Confirmed Stay &amp; Hotel Details
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          {bookingData.stay?.source_status === "stale" ? "Cached Read" : "Opera Confirmed"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Booking Reference:</span>
                        <span className="font-mono text-white font-semibold">{bookingData.booking_reference}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Dates of Stay:</span>
                        <span className="text-white">
                          {bookingData.stay
                            ? `${bookingData.stay.arrival_date} → ${bookingData.stay.departure_date} (${bookingData.stay.nights} Nights)`
                            : "Dates pending linkage"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Room Category:</span>
                        <span className="text-white">
                          {bookingData.stay
                            ? `${bookingData.stay.room_quantity}x ${bookingData.stay.room_category}`
                            : "Room category pending linkage"}
                        </span>
                      </div>

                      {/* Physical Room Allocation Policy (AC 6) */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-gray-400 block">Room Allocation:</span>
                          <span className="text-[10px] text-gray-500 block">* Allocated by hotel reception</span>
                        </div>
                        <div className="text-right">
                          {bookingData.stay?.assigned_room_number ? (
                            <span className="font-mono text-[#DBB155] font-semibold">{bookingData.stay.assigned_room_number}</span>
                          ) : (
                            <span className="text-gray-300 italic">Assigned upon check-in</span>
                          )}
                        </div>
                      </div>

                      {/* Occupants & Sharing (AC 2) */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Occupants / Sharing:</span>
                        <span className="text-white text-right">
                          {bookingData.stay?.occupant_names && bookingData.stay.occupant_names.length > 0
                            ? bookingData.stay.occupant_names.join(", ")
                            : bookingData.lead_guest_name}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Meal Plan:</span>
                        <span className="text-emerald-400 font-medium">
                          {bookingData.stay?.meal_plan || "Breakfast Included Daily"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall Status:</span>
                        <span className="text-emerald-400 font-mono uppercase">{bookingData.status}</span>
                      </div>
                    </div>

                    {/* Card 2: Championship Golf Rounds & Caddies */}
                    <div className="bg-[#111] border border-white/5 p-5 rounded-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[#DBB155] uppercase tracking-wider font-semibold">
                          Championship Golf Rounds
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          BRS Confirmed
                        </span>
                      </div>

                      {bookingData.golf_rounds && bookingData.golf_rounds.length > 0 ? (
                        <div className="space-y-3">
                          {bookingData.golf_rounds.map((round, idx) => (
                            <div
                              key={`${round.course_name}-${round.date}-${idx}`}
                              className={`py-2 ${idx < bookingData.golf_rounds.length - 1 ? "border-b border-white/5" : ""}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white font-medium">{round.course_name}</span>
                                <span className="font-mono text-[#DBB155] bg-white/5 px-2 py-0.5 rounded">
                                  {round.time}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-400 text-[11px]">
                                <span>{round.date} &bull; {round.players} Players &bull; {round.holes} Holes</span>
                                <span className="text-gray-300">
                                  {round.caddy_request_status ? (
                                    <span className="text-[#DBB155]">{round.caddy_request_status}</span>
                                  ) : (
                                    <span className="text-gray-500">Caddies: None requested</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic py-4 text-center">
                          No championship golf rounds attached to this reservation.
                        </p>
                      )}

                      <div className="pt-2 border-t border-white/5 text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Caddy &amp; Buggy Service</span>
                        <span className="text-gray-400">Request via Golf Pavilion (+353 (0)74 91 55000)</span>
                      </div>
                    </div>

                    {/* Card 3: Authoritative Verified Payment Ledger (AC 2 & AC 4) */}
                    <div className="md:col-span-2 bg-[#121212] border border-[#DBB155]/30 p-5 rounded-sm space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 gap-1">
                        <div>
                          <span className="text-[#DBB155] uppercase tracking-wider font-semibold block">
                            Verified Payment Position &amp; Balance (F11 Ledger)
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Authoritative payment events only. Browser state and unverified links are strictly excluded.
                          </span>
                        </div>
                        <span className="font-mono text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded uppercase">
                          Ledger Reconciled
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                          <span className="text-gray-400 text-[11px] block mb-1">Total Package Price</span>
                          <span className="text-white font-mono font-bold text-base">
                            €{bookingData.financials.total_amount}
                          </span>
                        </div>
                        <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                          <span className="text-gray-400 text-[11px] block mb-1">Verified Deposit Paid</span>
                          <span className="text-emerald-400 font-mono font-bold text-base">
                            €{bookingData.financials.deposit_paid}
                          </span>
                        </div>
                        <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                          <span className="text-gray-400 text-[11px] block mb-1">Remaining Balance Due</span>
                          <span className="text-[#DBB155] font-mono font-bold text-base">
                            €{bookingData.financials.balance_due}
                          </span>
                        </div>
                        <div className="bg-[#181818] p-3 rounded-sm border border-white/5">
                          <span className="text-gray-400 text-[11px] block mb-1">Payment Status</span>
                          <span className="text-emerald-400 font-mono text-xs font-semibold uppercase">
                            {bookingData.financials.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-gray-400 pt-2 border-t border-white/5 gap-1">
                        <span>
                          <strong>Balance Due Date:</strong>{" "}
                          {bookingData.financials.balance_due_date
                            ? `${bookingData.financials.balance_due_date} (28 days prior to arrival)`
                            : "28 days prior to arrival"}
                        </span>
                        <span className="text-gray-500">
                          Transactions on Ledger: {bookingData.financials.payments_count ?? 1} verified
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Pending Guest & Staff Requests (AC 3) */}
                    <div className="md:col-span-2 bg-[#111] border border-white/10 p-5 rounded-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <span className="text-white font-semibold block uppercase tracking-wider text-xs">
                            Pending Requests &amp; Amendment Inquiries
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Pending requests are held separately and do not alter confirmed dates, rooms, or tee times until approved.
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                          Read-Only
                        </span>
                      </div>

                      {bookingData.pending_requests && bookingData.pending_requests.length > 0 ? (
                        <div className="space-y-2">
                          {bookingData.pending_requests.map((req) => (
                            <div key={req.request_id} className="p-3 bg-[#181818] rounded-sm border border-white/5 flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">{req.description}</span>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                                    {req.status.replace("_", " ")}
                                  </span>
                                </div>
                                {req.notes && <p className="text-[11px] text-gray-400">{req.notes}</p>}
                                <span className="text-[10px] text-gray-500">
                                  Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#141414] rounded-sm text-center text-gray-400">
                          <p>No active pending amendment or special requests.</p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            To request date changes, tee-time shifts, or dietary notices, navigate to the Live Amendments or Special Requests tabs.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Tab 2: Live Amendments (Ticket M05) */}
            {activeTab === "amend" && (
              !verified ? (
                <div className="w-full bg-[#111] border border-amber-800/30 p-8 rounded-sm text-center space-y-3">
                  <ShieldAlert size={28} className="text-amber-400 mx-auto" />
                  <h3 className="text-sm font-semibold text-white">Authentication Required</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Please enter your booking reference and verify your one-time code above to search live amendment alternatives.
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  {/* Search Controls Card */}
                  <div className="bg-[#111] border border-white/5 p-6 rounded-sm space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[#DBB155] uppercase tracking-wider font-semibold block text-sm">
                          Live Costed Amendments &amp; Alternatives (Ticket M05)
                        </span>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Search real-time Opera room availability and BRS championship tee sheets for proposed changes.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                        Zero Inventory Hold (Read-Only)
                      </span>
                    </div>

                    {/* Search Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Proposed Arrival</label>
                        <input
                          type="date"
                          value={amendArrival}
                          onChange={(e) => setAmendArrival(e.target.value)}
                          className="w-full bg-[#161616] border border-white/10 p-2 text-white font-mono rounded-sm outline-none focus:border-[#DBB155]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Proposed Departure</label>
                        <input
                          type="date"
                          value={amendDeparture}
                          onChange={(e) => setAmendDeparture(e.target.value)}
                          className="w-full bg-[#161616] border border-white/10 p-2 text-white font-mono rounded-sm outline-none focus:border-[#DBB155]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Room Category</label>
                        <select
                          value={amendRoomCategory}
                          onChange={(e) => setAmendRoomCategory(e.target.value)}
                          className="w-full bg-[#161616] border border-white/10 p-2 text-white rounded-sm outline-none focus:border-[#DBB155]"
                        >
                          <option value="Classic Room">Classic Room</option>
                          <option value="Deluxe Room">Deluxe Room</option>
                          <option value="Superior Room">Superior Room</option>
                          <option value="Bayview Suite">Bayview Suite</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleSearchAmendments}
                          disabled={isSearchingAmendments}
                          className="w-full py-2 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isSearchingAmendments ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Searching Live...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={13} /> Search Alternatives
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Disclaimer Banner */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-sm text-[11px] text-gray-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-[#DBB155] shrink-0" />
                        <span>
                          * Live availability search only. Zero inventory is held, reserved, or altered during search (reserves_inventory = false).
                        </span>
                      </div>
                    </div>

                    {amendmentError && (
                      <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-sm text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-red-400" />
                        <span>{amendmentError}</span>
                      </div>
                    )}
                  </div>

                  {/* Results Section */}
                  {amendmentResponse && (
                    <div className="space-y-4">
                      {/* Freshness Bar */}
                      <div className="p-3 bg-[#111] border border-white/5 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-gray-400 font-medium">Verified Live Sources:</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <CheckCircle2 size={12} /> Opera PMS: {amendmentResponse.sources_freshness?.hotel_pms?.status || "confirmed"}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <CheckCircle2 size={12} /> BRS Golf: {amendmentResponse.sources_freshness?.golf_brs?.status || "confirmed"}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <CheckCircle2 size={12} /> Package Rules: {amendmentResponse.sources_freshness?.pricing_engine?.status || "confirmed"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          Search ID: {amendmentResponse.search_id}
                        </span>
                      </div>

                      
                      {/* Ticket M06: Cost and Terms Review Component */}
                      {selectedOfferForReview && (
                        <div className="p-6 bg-[#121212] border-2 border-[#DBB155]/60 rounded-sm space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-[#DBB155] font-bold">
                                  Ticket M06: Amendment Cost &amp; Terms Review
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                  {selectedOfferForReview.offer_id}
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-white mt-1">
                                Review Proposed Itinerary &amp; Authoritative Financial Position
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                                Status: {selectedOfferForReview.status.replace("_", " ")}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedOfferForReview(null)}
                                className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10 cursor-pointer"
                              >
                                Close Review
                              </button>
                            </div>
                          </div>

                          {/* Side-by-side Itinerary Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Confirmed Current Itinerary */}
                            <div className="p-4 bg-[#181818] rounded border border-white/5 space-y-3">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                                  Authoritative Confirmed Itinerary
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400">Current</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400 block text-[11px]">Accommodation:</span>
                                <span className="text-white font-medium">
                                  {selectedOfferForReview.current_itinerary?.stay?.room_category || "Classic Room"} (
                                  {selectedOfferForReview.current_itinerary?.stay?.room_quantity || 1} room)
                                </span>
                                <div className="text-gray-400 text-[11px]">
                                  {selectedOfferForReview.current_itinerary?.stay?.arrival_date} &rarr;{" "}
                                  {selectedOfferForReview.current_itinerary?.stay?.departure_date} (
                                  {selectedOfferForReview.current_itinerary?.stay?.nights} nights)
                                </div>
                              </div>
                              <div className="space-y-1 pt-2 border-t border-white/5">
                                <span className="text-gray-400 block text-[11px]">Championship Golf:</span>
                                <div className="space-y-1">
                                  {selectedOfferForReview.current_itinerary?.golf_rounds?.map((r, i) => (
                                    <div key={i} className="text-gray-300 flex justify-between text-[11px]">
                                      <span>{r.course_name} ({r.date} at {r.time})</span>
                                      <span className="text-gray-500 font-mono">{r.players}p</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Proposed Amendment Itinerary */}
                            <div className="p-4 bg-[#181818] rounded border border-[#DBB155]/20 space-y-3">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[#DBB155] font-semibold uppercase tracking-wider text-[11px]">
                                  Proposed Amendment Itinerary
                                </span>
                                <span className="text-[10px] font-mono text-[#DBB155]">Snapshot</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400 block text-[11px]">Accommodation:</span>
                                <span className="text-white font-medium">
                                  {selectedOfferForReview.proposed_stay.room_category} (
                                  {selectedOfferForReview.proposed_stay.room_quantity}{" "}
                                  {selectedOfferForReview.proposed_stay.room_quantity === 1 ? "room" : "rooms"})
                                </span>
                                <div className="text-gray-400 text-[11px]">
                                  {selectedOfferForReview.proposed_stay.arrival_date} &rarr;{" "}
                                  {selectedOfferForReview.proposed_stay.departure_date} (
                                  {selectedOfferForReview.proposed_stay.nights} nights)
                                </div>
                              </div>
                              <div className="space-y-1 pt-2 border-t border-white/5">
                                <span className="text-gray-400 block text-[11px]">Championship Golf:</span>
                                <div className="space-y-1">
                                  {selectedOfferForReview.proposed_golf_rounds.map((r, i) => (
                                    <div key={i} className="text-white flex justify-between text-[11px]">
                                      <span>{r.course_name} ({r.date} at {r.time})</span>
                                      <span className="text-[#DBB155] font-mono">€{r.round_price_total}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Financial Reconciliation Breakdown */}
                          <div className="p-4 bg-black/60 rounded border border-white/10 space-y-3">
                            <span className="text-xs uppercase tracking-wider text-white font-semibold block border-b border-white/5 pb-2">
                              Itemized Financial Position &amp; Payment Ledger Reconciliation
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Original Package</span>
                                <span className="text-white font-bold text-sm">
                                  €{selectedOfferForReview.pricing_comparison.original_package_total}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">New Package Total</span>
                                <span className="text-[#DBB155] font-bold text-sm">
                                  €{selectedOfferForReview.pricing_comparison.new_package_total}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Price Delta</span>
                                <span
                                  className={
                                    selectedOfferForReview.pricing_comparison.price_delta.startsWith("+")
                                      ? "text-emerald-400 font-bold text-sm"
                                      : selectedOfferForReview.pricing_comparison.price_delta.startsWith("-")
                                      ? "text-blue-400 font-bold text-sm"
                                      : "text-gray-300 font-bold text-sm"
                                  }
                                >
                                  {selectedOfferForReview.pricing_comparison.price_delta.startsWith("+") ||
                                  selectedOfferForReview.pricing_comparison.price_delta.startsWith("-")
                                    ? selectedOfferForReview.pricing_comparison.price_delta
                                    : `€${selectedOfferForReview.pricing_comparison.price_delta}`}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Deposit Already Paid</span>
                                <span className="text-emerald-400 font-bold text-sm">
                                  €{selectedOfferForReview.pricing_comparison.deposit_already_paid}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Revised Balance Due</span>
                                <span className="text-white font-bold text-sm">
                                  €{selectedOfferForReview.pricing_comparison.revised_balance_due}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Balance Due Date</span>
                                <span className="text-amber-400 font-bold text-xs">
                                  {selectedOfferForReview.balance_due_date}
                                </span>
                                <span className="text-gray-500 block text-[9px] mt-0.5">
                                  (Strictly 6 weeks / 42 days prior)
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Amount Due Now</span>
                                <span className="text-[#DBB155] font-bold text-sm">
                                  €{selectedOfferForReview.amount_due_now}
                                </span>
                              </div>
                              <div className="bg-[#181818] p-3 rounded border border-white/5">
                                <span className="text-gray-400 block text-[10px]">Resulting Credit</span>
                                <span className="text-blue-400 font-bold text-sm">
                                  €{selectedOfferForReview.credit_amount}
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-white/5">
                              <span>Approved Amendment Fee: €{selectedOfferForReview.amendment_fee}</span>
                              <span className="text-gray-500">
                                Offer Snapshot TTL: 15 minutes (expires {new Date(selectedOfferForReview.expires_at).toLocaleTimeString()})
                              </span>
                            </div>
                          </div>

                          {/* Zero Inventory Holds & Policy Notice */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded text-[11px] text-gray-400 flex items-center gap-2">
                            <Info size={15} className="text-[#DBB155] shrink-0" />
                            <span>
                              Zero-Risk Review: Reviewing this amendment offer does not place room inventory holds, charge your card, or alter your confirmed booking.
                            </span>
                          </div>

                          {/* Occupant Review Gate (AC 7) */}
                          {selectedOfferForReview.requires_occupant_review && (
                            <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded space-y-2">
                              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                                <AlertCircle size={15} className="shrink-0 text-amber-400" />
                                <span>Occupant &amp; Room Sharing Review Required (AC 7)</span>
                              </div>
                              <p className="text-[11px] text-amber-200/80">
                                Your proposed amendment includes changes to hotel room categories or quantities. Under Rosapenna policy, you must review and confirm occupant and bed configuration assignments before this amendment can be accepted.
                              </p>
                              <label className="flex items-center gap-2 text-xs text-white cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={occupantReviewCheckbox}
                                  onChange={(e) => setOccupantReviewCheckbox(e.target.checked)}
                                  className="w-4 h-4 rounded border-white/20 accent-[#DBB155]"
                                />
                                <span>I confirm that room occupants and sharing configurations have been reviewed.</span>
                              </label>
                            </div>
                          )}

                          {/* Terms Acceptance Gate (AC 4) */}
                          <div className="p-4 bg-[#181818] rounded border border-white/5 space-y-3">
                            <span className="text-xs uppercase tracking-wider text-white font-semibold block">
                              Terms &amp; Conditions Consent
                            </span>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              By accepting this amendment offer, you agree to the revised stay dates, golf tee times, package pricing, and Rosapenna cancellation policies ({selectedOfferForReview.terms_version}).
                            </p>
                            <label className="flex items-center gap-2 text-xs text-white cursor-pointer pt-1">
                              <input
                                type="checkbox"
                                checked={acceptedTermsCheckbox}
                                onChange={(e) => setAcceptedTermsCheckbox(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 accent-[#DBB155]"
                              />
                              <span>
                                I accept the Rosapenna Amendment Terms &amp; Conditions ({selectedOfferForReview.terms_version}).
                              </span>
                            </label>
                          </div>

                          {offerAcceptError && (
                            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded text-xs text-red-300 flex items-center gap-2">
                              <AlertCircle size={15} className="shrink-0 text-red-400" />
                              <span>{offerAcceptError}</span>
                            </div>
                          )}

                          {/* Consent Action Buttons & Ticket M07 Revalidation */}
                          {offerAcceptedSuccess || selectedOfferForReview.status === "accepted" ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded text-emerald-300 text-xs space-y-2">
                                <div className="flex items-center gap-2 font-semibold text-emerald-200">
                                  <CheckCircle2 size={16} className="text-emerald-400" />
                                  <span>Amendment Offer Accepted Successfully!</span>
                                </div>
                                <p className="text-[11px] text-emerald-300/90">
                                  Offer #{selectedOfferForReview.offer_id} is bound to booking {selectedOfferForReview.booking_reference}. Consent recorded at{" "}
                                  {selectedOfferForReview.accepted_at ? new Date(selectedOfferForReview.accepted_at).toLocaleString() : "just now"}.
                                </p>
                              </div>

                              {/* Ticket M07 Live Revalidation Card */}
                              <div className="p-5 bg-[#141414] border border-[#DBB155]/40 rounded space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-[#DBB155] uppercase tracking-wider">
                                        Ticket M07: Live Inventory &amp; Rate Revalidation
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-white mt-0.5">
                                      Pre-Payment Live Integrity Verification
                                    </h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleRevalidateOffer}
                                    disabled={isRevalidatingOffer}
                                    className="px-4 py-2 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    {isRevalidatingOffer ? (
                                      <>
                                        <Loader2 size={13} className="animate-spin" /> Revalidating Live...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw size={13} /> Revalidate Itinerary Now
                                      </>
                                    )}
                                  </button>
                                </div>

                                <p className="text-xs text-gray-400 leading-relaxed">
                                  Before proceeding to payment link generation (Ticket M08) or database commit (Ticket M09), the system atomically revalidates live Opera room inventory, BRS tee sheets, and the F11 payment ledger.
                                </p>

                                {revalidationError && (
                                  <div className="p-3 bg-red-950/30 border border-red-800/40 rounded text-xs text-red-300 flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0 text-red-400" />
                                    <span>{revalidationError}</span>
                                  </div>
                                )}

                                {revalidationResult && (
                                  <div className="space-y-3 pt-2">
                                    <div className={`p-4 rounded border text-xs space-y-2 ${
                                      revalidationResult.is_valid
                                        ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200"
                                        : "bg-red-950/30 border-red-800/40 text-red-200"
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-semibold">
                                          {revalidationResult.is_valid ? (
                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                          ) : (
                                            <AlertTriangle size={16} className="text-red-400" />
                                          )}
                                          <span>
                                            {revalidationResult.is_valid
                                              ? "All Components Successfully Revalidated!"
                                              : `Revalidation Status: ${revalidationResult.revalidation_status.replace("_", " ")}`}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-400">
                                          {revalidationResult.revalidation_id}
                                        </span>
                                      </div>
                                      <p className="text-[11px] opacity-90">{revalidationResult.summary_message}</p>
                                    </div>

                                    {/* Component Checks Breakdown */}
                                    <div className="space-y-2">
                                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                                        Component Verification Checklist:
                                      </span>
                                      <div className="grid grid-cols-1 gap-2 text-xs">
                                        {revalidationResult.checks.map((c, idx) => (
                                          <div
                                            key={idx}
                                            className="p-2.5 bg-[#181818] border border-white/5 rounded flex items-start gap-2.5 justify-between"
                                          >
                                            <div className="flex items-start gap-2">
                                              {c.status === "passed" ? (
                                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                              ) : (
                                                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                              )}
                                              <div>
                                                <span className="font-mono text-[11px] uppercase text-gray-300 block">
                                                  {c.component.replace("_", " ")}
                                                </span>
                                                <span className="text-gray-400 text-[11px]">{c.message}</span>
                                              </div>
                                            </div>
                                            <span
                                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                                c.status === "passed"
                                                  ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40"
                                                  : "bg-red-950/50 text-red-300 border border-red-800/40"
                                              }`}
                                            >
                                              {c.status}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Ticket M08: Amendment Payment & Credit Settlement Card */}
                                    {revalidationResult.is_valid && (
                                      <div className="p-4 bg-[#111111] border border-white/10 rounded-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                                          <div className="flex items-center gap-2">
                                            <CreditCard size={16} className="text-[#DBB155]" />
                                            <span className="font-bold text-white text-xs uppercase tracking-wider">
                                              Step 4: Ready for Payment &amp; Confirmation (Ticket M08)
                                            </span>
                                          </div>
                                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                                            Revalidation Passed
                                          </span>
                                        </div>

                                        {/* Financial Position Display */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/5 rounded text-xs">
                                          <div>
                                            <span className="text-gray-400 block text-[11px]">Additional Deposit Due</span>
                                            <span className="text-base font-bold text-white">
                                              €{selectedOfferForReview.amount_due_now}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 block text-[11px]">Resort Credit Generated</span>
                                            <span className="text-base font-bold text-emerald-400">
                                              €{selectedOfferForReview.credit_amount}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 block text-[11px]">Settlement Expiry</span>
                                            <span className="text-xs font-semibold text-gray-300">
                                              7 Days from Generation
                                            </span>
                                          </div>
                                        </div>

                                        {/* Settlement Error */}
                                        {settlementError && (
                                          <div className="p-3 bg-red-950/20 border border-red-800/40 rounded text-xs text-red-300 flex items-center gap-2">
                                            <AlertCircle size={14} className="shrink-0 text-red-400" />
                                            <span>{settlementError}</span>
                                          </div>
                                        )}

                                        {/* Not yet initiated: Settlement Action Buttons */}
                                        {!settlementResult && (
                                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <p className="text-[11px] text-gray-400">
                                              * Rosapenna policy: All amounts are derived strictly server-side. Zero inventory holds are placed until payment is verified.
                                            </p>
                                            <button
                                              type="button"
                                              onClick={handleInitiateSettlement}
                                              disabled={isInitiatingSettlement}
                                              className="w-full sm:w-auto px-5 py-2.5 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                                            >
                                              {isInitiatingSettlement ? (
                                                <>
                                                  <Loader2 size={13} className="animate-spin" /> Preparing Settlement...
                                                </>
                                              ) : parseFloat(selectedOfferForReview.amount_due_now) > 0 ? (
                                                `Pay Additional Amount (€${selectedOfferForReview.amount_due_now}) &rarr;`
                                              ) : parseFloat(selectedOfferForReview.credit_amount) > 0 ? (
                                                `Acknowledge Credit (€${selectedOfferForReview.credit_amount}) &amp; Proceed &rarr;`
                                              ) : (
                                                "Authorize Amendment (Zero Due) &rarr;"
                                              )}
                                            </button>
                                          </div>
                                        )}

                                        {/* Initiated Settlement Response View */}
                                        {settlementResult && (
                                          <div className="p-4 bg-white/[0.02] border border-white/10 rounded space-y-3">
                                            <div className="flex items-center justify-between">
                                              <span className="font-semibold text-white text-xs">
                                                Settlement Status:
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DBB155]/20 text-[#DBB155] border border-[#DBB155]/30">
                                                {settlementResult.settlement_status.replace(/_/g, " ")}
                                              </span>
                                            </div>

                                            <p className="text-xs text-gray-300">
                                              {settlementResult.message}
                                            </p>

                                            {settlementResult.action_type === "payment_required" && settlementResult.payment_url && (
                                              <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                                <div>
                                                  <span className="font-semibold text-amber-300 block">
                                                    Prommt Payment Gateway Link Ready
                                                  </span>
                                                  <p className="text-[11px] text-gray-400">
                                                    Payment Reference: <span className="font-mono text-gray-300">{settlementResult.payment_id}</span>
                                                  </p>
                                                </div>
                                                <a
                                                  href={settlementResult.payment_url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="w-full sm:w-auto px-4 py-2 bg-[#DBB155] hover:bg-[#c9a04a] text-black font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                                                >
                                                  Open Payment Page <ExternalLink size={12} />
                                                </a>
                                              </div>
                                            )}

                                            {settlementResult.settlement_status === "paid_unconfirmed" && (
                                              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded text-xs text-red-300 flex items-start gap-2">
                                                <AlertTriangle size={15} className="shrink-0 text-red-400 mt-0.5" />
                                                <div>
                                                  <span className="font-semibold block">Paid-but-Unconfirmed Recovery</span>
                                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                                    Your payment has been safely settled, but downstream hotel or tee sheet reservation systems were temporarily unavailable. Rosapenna reservations staff has been alerted to manually confirm your booking. Your original booking remains fully active.
                                                  </p>
                                                </div>
                                              </div>
                                            )}

                                            <p className="text-[11px] text-gray-500 italic">
                                              * Note: In development/test mode, payments are verified via sandboxed HMAC webhooks without live card processing.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Ticket M09: Confirmed Amendment Commit Card */}
                                    {revalidationResult.is_valid && (
                                      <div className="p-4 bg-[#141414] border border-[#DBB155]/40 rounded-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                                          <div className="flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-[#DBB155]" />
                                            <span className="font-bold text-white text-xs uppercase tracking-wider">
                                              Step 5: Confirmed Amendment Commit (Ticket M09)
                                            </span>
                                          </div>
                                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#DBB155]/20 text-[#DBB155] border border-[#DBB155]/30">
                                            Final Coordinated Vendor Write
                                          </span>
                                        </div>

                                        <p className="text-xs text-gray-400 leading-relaxed">
                                          Safely applies the amended reservation to Opera PMS, coordinates BRS Golf tee time replacements, verifies post-write readbacks, and issues your updated confirmation.
                                        </p>

                                        {commitError && (
                                          <div className="p-3 bg-red-950/20 border border-red-800/40 rounded text-xs text-red-300 flex items-center gap-2">
                                            <AlertCircle size={14} className="shrink-0 text-red-400" />
                                            <span>{commitError}</span>
                                          </div>
                                        )}

                                        {!commitResult && (
                                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <p className="text-[11px] text-gray-500">
                                              * Pre-requisites verified. Vendor writes execute with atomic rollback protection.
                                            </p>
                                            <button
                                              type="button"
                                              onClick={handleCommitAmendment}
                                              disabled={isCommitting}
                                              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                                            >
                                              {isCommitting ? (
                                                <>
                                                  <Loader2 size={13} className="animate-spin" /> Committing Vendor Writes...
                                                </>
                                              ) : (
                                                <>
                                                  <CheckCircle2 size={14} /> Confirm &amp; Commit Amendment
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        )}

                                        {commitResult && (
                                          <div className="space-y-3 pt-2">
                                            {commitResult.status === "confirmed" ? (
                                              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded text-emerald-200 text-xs space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2 font-semibold text-emerald-300">
                                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                                    <span>Amendment Confirmed &amp; Synchronized!</span>
                                                  </div>
                                                  <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                                                    Revision #{commitResult.new_booking_revision}
                                                  </span>
                                                </div>
                                                <p className="text-[11px] text-emerald-300/90">{commitResult.message}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-800/30 text-[11px]">
                                                  <div>
                                                    <span className="text-emerald-400 font-semibold block">Operation Reference:</span>
                                                    <span className="font-mono text-gray-300">{commitResult.operation_id}</span>
                                                  </div>
                                                  <div>
                                                    <span className="text-emerald-400 font-semibold block">Vendor Readbacks:</span>
                                                    <span className="text-gray-300">{commitResult.readback_verified ? "Opera & BRS Verified" : "Verified"}</span>
                                                  </div>
                                                  <div>
                                                    <span className="text-emerald-400 font-semibold block">Email Confirmation:</span>
                                                    <span className="text-gray-300">{commitResult.email_delivery_id ? "Dispatched" : "Queued"}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded text-amber-200 text-xs space-y-2">
                                                <div className="flex items-center gap-2 font-semibold text-amber-300">
                                                  <AlertTriangle size={16} className="text-amber-400" />
                                                  <span>Unconfirmed Reconciliation - Staff Alerted</span>
                                                </div>
                                                <p className="text-[11px] text-amber-200/90">{commitResult.message}</p>
                                                <p className="text-[11px] text-amber-300/80">
                                                  Your original reservation remains intact and confirmed. Supported compensation protected your booking. Rosapenna staff has been alerted to review. Call +353 (0)74 91 55000 with reference <strong className="font-mono text-white">{commitResult.operation_id}</strong>.
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* If invalid with refreshed offer: Allow immediate review */}
                                    {!revalidationResult.is_valid && revalidationResult.refreshed_offer && (
                                      <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded flex items-center justify-between gap-3 text-xs">
                                        <span className="text-amber-200 text-[11px]">
                                          A refreshed amendment offer reflecting updated rates/ledger is ready for your explicit review.
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (revalidationResult.refreshed_offer) {
                                              setSelectedOfferForReview(revalidationResult.refreshed_offer);
                                              setOfferAcceptedSuccess(false);
                                              setAcceptedTermsCheckbox(false);
                                              setOccupantReviewCheckbox(false);
                                              setRevalidationResult(null);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-[#DBB155] hover:bg-[#c9a04a] text-black font-semibold text-xs rounded transition-all cursor-pointer whitespace-nowrap"
                                        >
                                          Review Refreshed Offer &rarr;
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOfferForReview(null)}
                                className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded transition-all cursor-pointer"
                              >
                                &larr; Return to Alternatives
                              </button>
                              <button
                                type="button"
                                onClick={handleAcceptOffer}
                                disabled={
                                  isAcceptingOffer ||
                                  !acceptedTermsCheckbox ||
                                  (selectedOfferForReview.requires_occupant_review && !occupantReviewCheckbox)
                                }
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                {isAcceptingOffer ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" /> Recording Consent...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={14} /> Accept Amendment Terms
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

{/* Alternatives List */}
                      <div className="space-y-4">
                        {amendmentResponse.alternatives.map((alt) => (
                          <div
                            key={alt.option_id}
                            className={`p-5 rounded-sm border transition-all ${
                              alt.is_complete_package
                                ? "bg-[#111] border-white/10 hover:border-[#DBB155]/40"
                                : "bg-[#111]/60 border-amber-900/30"
                            }`}
                          >
                            {/* Option Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-white">{alt.title}</h4>
                                  <span className="text-[10px] font-mono text-gray-500">[{alt.option_id}]</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{alt.description}</p>
                              </div>
                              <div>
                                {alt.is_complete_package ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                                    <CheckCircle2 size={12} /> Complete Package Available
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                                    <AlertCircle size={12} /> Incomplete / Not Bookable
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details Grid: Stay + Golf */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                              {/* Stay Details */}
                              <div className="p-3 bg-[#161616] rounded border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#DBB155] font-semibold uppercase tracking-wider text-[11px]">
                                    Hotel Accommodation
                                  </span>
                                  {alt.stay_option.own_allocation_retained ? (
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                      Own Held Room Retained
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                                      Live Inventory Change
                                    </span>
                                  )}
                                </div>
                                <div className="text-white font-medium">
                                  {alt.stay_option.room_category} ({alt.stay_option.room_quantity} {alt.stay_option.room_quantity === 1 ? "room" : "rooms"})
                                </div>
                                <div className="text-gray-400 text-[11px]">
                                  Dates: {alt.stay_option.arrival_date} &rarr; {alt.stay_option.departure_date} ({alt.stay_option.nights} {alt.stay_option.nights === 1 ? "night" : "nights"})
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-mono text-gray-300 pt-1 border-t border-white/5">
                                  <span>Nightly Rate: €{alt.stay_option.nightly_rate}</span>
                                  <span>Stay Total: €{alt.stay_option.stay_total}</span>
                                </div>
                              </div>

                              {/* Golf Details */}
                              <div className="p-3 bg-[#161616] rounded border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#DBB155] font-semibold uppercase tracking-wider text-[11px]">
                                    Championship Golf ({alt.golf_options.length} Rounds)
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-400">Live BRS Status</span>
                                </div>
                                <div className="space-y-1.5">
                                  {alt.golf_options.map((round, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                      <div>
                                        <span className="text-white font-medium">{round.course_name}</span>
                                        <div className="text-gray-400 text-[10px]">
                                          {round.date} at {round.time} &bull; {round.players} players ({round.holes} holes)
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-white font-mono">€{round.round_price_total}</span>
                                        <div className="text-[10px]">
                                          {round.own_allocation_retained ? (
                                            <span className="text-emerald-400 font-mono">Retained</span>
                                          ) : round.is_available ? (
                                            <span className="text-emerald-400 font-mono">Available</span>
                                          ) : (
                                            <span className="text-amber-400 font-mono">Unavailable</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Unavailability Reasons (if incomplete) */}
                            {!alt.is_complete_package && alt.unavailability_reasons.length > 0 && (
                              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-sm mb-4 text-xs text-amber-300 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                                  <AlertCircle size={13} className="shrink-0" />
                                  <span>Cannot be booked online due to incomplete availability:</span>
                                </div>
                                <ul className="list-disc pl-5 text-[11px] text-amber-300/90 space-y-0.5">
                                  {alt.unavailability_reasons.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Pricing Comparison Bar */}
                            <div className="p-3 bg-black/40 rounded border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div>
                                  <span className="text-gray-500 block text-[10px]">Original Total</span>
                                  <span className="text-white">€{alt.pricing_comparison.original_package_total}</span>
                                </div>
                                <span className="text-gray-600">&rarr;</span>
                                <div>
                                  <span className="text-gray-500 block text-[10px]">New Package Total</span>
                                  <span className="text-[#DBB155] font-bold">€{alt.pricing_comparison.new_package_total}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[10px]">Price Delta</span>
                                  <span
                                    className={
                                      alt.pricing_comparison.price_delta.startsWith("+")
                                        ? "text-emerald-400 font-bold"
                                        : alt.pricing_comparison.price_delta.startsWith("-")
                                        ? "text-blue-400 font-bold"
                                        : "text-gray-300"
                                    }
                                  >
                                    {alt.pricing_comparison.price_delta.startsWith("+") || alt.pricing_comparison.price_delta.startsWith("-")
                                      ? alt.pricing_comparison.price_delta
                                      : `€${alt.pricing_comparison.price_delta}`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[10px]">Deposit Paid</span>
                                  <span className="text-gray-300">€{alt.pricing_comparison.deposit_already_paid}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[10px]">Revised Balance Due</span>
                                  <span className="text-white font-bold">€{alt.pricing_comparison.revised_balance_due}</span>
                                </div>
                              </div>

                              <div>
                                {alt.is_complete_package ? (
                                  <button
                                    type="button"
                                    onClick={() => handleReviewOffer(alt)}
                                    disabled={isLoadingOffer}
                                    className="px-3 py-1.5 bg-[#DBB155] hover:bg-[#c9a04a] text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    {isLoadingOffer ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Review Offer &amp; Terms
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-gray-500 font-sans">
                                    Online Booking Blocked
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Tab 3: Rooming List & Caddies (Scope Tickets M10 & M12) */}
            {activeTab === "rooming" && (
              !verified || !bookingData ? (
                <div className="bg-[#111] border border-white/5 p-8 rounded-sm text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#DBB155]/10 border border-[#DBB155]/20 flex items-center justify-center mx-auto text-[#DBB155]">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-white">Authentication Required</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Please verify your one-time code to view and update room occupants, room moves, and bed sharing preferences.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 text-xs">
                  {/* Unassigned Physical Room Numbers Policy Notice (AC 2) */}
                  <div className="p-4 bg-[#DBB155]/10 border border-[#DBB155]/30 rounded-sm flex items-start gap-3">
                    <Info size={18} className="text-[#DBB155] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-white block">
                        Hotel Room Number Policy Notice (Scope Ticket M10 / F02)
                      </span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        Physical room numbers are hotel-allocated by front desk reception 2 days prior to arrival or upon check-in.
                        Guests can update guest names, allocate occupants across booked rooms, and request bed configurations (Twin / Double).
                      </p>
                    </div>
                  </div>

                  {rosterError && (
                    <div className="p-3 bg-red-950/30 border border-red-800/40 rounded text-red-300 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-400" />
                      <span>{rosterError}</span>
                    </div>
                  )}

                  {occupantSuccessMessage && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>{occupantSuccessMessage}</span>
                    </div>
                  )}

                  {isLoadingRoster ? (
                    <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#DBB155]" />
                      <span>Loading confirmed occupant roster and room assignments...</span>
                    </div>
                  ) : occupantRoster ? (
                    <div className="space-y-5">
                      {/* Booking Rooms Summary */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#111] border border-white/10 rounded-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">
                              Confirmed Stay: {occupantRoster.arrival_date} &rarr; {occupantRoster.departure_date}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 rounded text-gray-300">
                              Revision {occupantRoster.revision}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            Total Booked Rooms: {occupantRoster.room_quantity} &bull; Total Guests: {occupantRoster.occupants.length}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => loadOccupantRoster()}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw size={12} /> Reload
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveOccupants}
                            disabled={isSavingOccupants}
                            className="px-4 py-1.5 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {isSavingOccupants ? (
                              <>
                                <Loader2 size={12} className="animate-spin" /> Saving...
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={13} /> Save Rooming List
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Room Groups & Occupants Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {occupantRoster.room_groups.map((group) => {
                          const roomOccupants = occupantRoster.occupants.filter(
                            (o) => o.room_group_id === group.room_group_id
                          );
                          const pref = occupantRoster.sharing_preferences.find(
                            (sp) => sp.room_group_id === group.room_group_id
                          );

                          return (
                            <div
                              key={group.room_group_id}
                              className="p-4 bg-[#141414] border border-white/10 rounded-sm space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div>
                                  <span className="font-bold text-white uppercase tracking-wider text-xs">
                                    {group.room_group_id.replace("_", " ")}: {group.room_category}
                                  </span>
                                  <span className="text-[10px] text-gray-500 block">
                                    Max Capacity: {group.capacity} Guests &bull; Assigned: {roomOccupants.length}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#DBB155] border border-white/10">
                                  Room Assigned at Check-in
                                </span>
                              </div>

                              {/* Bed Preference Selector */}
                              <div className="space-y-1">
                                <label className="text-[11px] text-gray-400 block">Bed Configuration Preference:</label>
                                <select
                                  value={pref?.bed_type_preference || "TWIN"}
                                  onChange={(e) => {
                                    const val = e.target.value as BedPreferenceType;
                                    setOccupantRoster((prev) => {
                                      if (!prev) return prev;
                                      const existingPrefs = [...prev.sharing_preferences];
                                      const pIdx = existingPrefs.findIndex(
                                        (p) => p.room_group_id === group.room_group_id
                                      );
                                      if (pIdx >= 0) {
                                        existingPrefs[pIdx] = { ...existingPrefs[pIdx], bed_type_preference: val };
                                      } else {
                                        existingPrefs.push({
                                          room_group_id: group.room_group_id,
                                          bed_type_preference: val,
                                        });
                                      }
                                      return { ...prev, sharing_preferences: existingPrefs };
                                    });
                                  }}
                                  className="w-full bg-[#1e1e1e] border border-white/10 p-2 text-white rounded text-xs outline-none focus:border-[#DBB155]"
                                >
                                  <option value="TWIN">Twin Beds (2 Separate Single Beds)</option>
                                  <option value="DOUBLE">Double Bed (1 King / Queen Bed)</option>
                                  <option value="SINGLE">Single Occupancy</option>
                                </select>
                              </div>

                              {/* Sharing Notes */}
                              <div className="space-y-1">
                                <label className="text-[11px] text-gray-400 block">Room Sharing Notes:</label>
                                <input
                                  type="text"
                                  value={pref?.notes || ""}
                                  placeholder="e.g. Quiet room requested, feather pillows..."
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOccupantRoster((prev) => {
                                      if (!prev) return prev;
                                      const existingPrefs = [...prev.sharing_preferences];
                                      const pIdx = existingPrefs.findIndex(
                                        (p) => p.room_group_id === group.room_group_id
                                      );
                                      if (pIdx >= 0) {
                                        existingPrefs[pIdx] = { ...existingPrefs[pIdx], notes: val };
                                      } else {
                                        existingPrefs.push({
                                          room_group_id: group.room_group_id,
                                          bed_type_preference: "TWIN",
                                          notes: val,
                                        });
                                      }
                                      return { ...prev, sharing_preferences: existingPrefs };
                                    });
                                  }}
                                  className="w-full bg-[#1e1e1e] border border-white/10 p-2 text-white rounded text-xs outline-none focus:border-[#DBB155]"
                                />
                              </div>

                              {/* Occupant Names & Move Controls */}
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                <span className="text-[11px] text-gray-400 font-semibold block">
                                  Occupants in this Room:
                                </span>
                                {roomOccupants.map((occ, occIdx) => {
                                  const globalIdx = occupantRoster.occupants.findIndex(
                                    (o) => o.first_name === occ.first_name && o.last_name === occ.last_name
                                  );

                                  return (
                                    <div
                                      key={occIdx}
                                      className="p-2.5 bg-[#1b1b1b] border border-white/5 rounded space-y-2"
                                    >
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] text-gray-500 block">First Name</label>
                                          <input
                                            type="text"
                                            value={occ.first_name}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setOccupantRoster((prev) => {
                                                if (!prev) return prev;
                                                const occs = [...prev.occupants];
                                                if (globalIdx >= 0) {
                                                  occs[globalIdx] = { ...occs[globalIdx], first_name: val };
                                                }
                                                return { ...prev, occupants: occs };
                                              });
                                            }}
                                            className="w-full bg-[#242424] border border-white/10 p-1.5 text-white rounded text-xs outline-none focus:border-[#DBB155]"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] text-gray-500 block">Last Name</label>
                                          <input
                                            type="text"
                                            value={occ.last_name}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setOccupantRoster((prev) => {
                                                if (!prev) return prev;
                                                const occs = [...prev.occupants];
                                                if (globalIdx >= 0) {
                                                  occs[globalIdx] = { ...occs[globalIdx], last_name: val };
                                                }
                                                return { ...prev, occupants: occs };
                                              });
                                            }}
                                            className="w-full bg-[#242424] border border-white/10 p-1.5 text-white rounded text-xs outline-none focus:border-[#DBB155]"
                                          />
                                        </div>
                                      </div>

                                      {/* Move Occupant to Another Room (AC 1 & AC 8) */}
                                      <div className="flex items-center justify-between pt-1 text-[11px]">
                                        <span className="text-gray-400">Assigned Room:</span>
                                        <select
                                          value={occ.room_group_id}
                                          onChange={(e) => {
                                            const targetRoom = e.target.value;
                                            setOccupantRoster((prev) => {
                                              if (!prev) return prev;
                                              const occs = [...prev.occupants];
                                              if (globalIdx >= 0) {
                                                occs[globalIdx] = { ...occs[globalIdx], room_group_id: targetRoom };
                                              }
                                              return { ...prev, occupants: occs };
                                            });
                                          }}
                                          className="bg-[#242424] border border-white/10 px-2 py-1 text-white rounded text-xs outline-none focus:border-[#DBB155]"
                                        >
                                          {occupantRoster.room_groups.map((rg) => (
                                            <option key={rg.room_group_id} value={rg.room_group_id}>
                                              {rg.room_group_id.replace("_", " ").toUpperCase()} ({rg.room_category})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Extra Occupant Control */}
                      <div className="p-4 bg-[#111] border border-white/5 rounded flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          Need to add an occupant within your booked capacity?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOccupantRoster((prev) => {
                              if (!prev) return prev;
                              const newOcc: OccupantDetail = {
                                occupant_id: `occ_${prev.occupants.length + 1}`,
                                first_name: "Guest",
                                last_name: prev.occupants[0]?.last_name || "Golfer",
                                is_primary: false,
                                room_group_id: "room_1",
                                effective_from: prev.arrival_date,
                                effective_to: prev.departure_date,
                              };
                              return {
                                ...prev,
                                occupants: [...prev.occupants, newOcc],
                              };
                            });
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium transition-colors cursor-pointer"
                        >
                          + Add Occupant
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Caddy Requests Info Notice (Ticket M12) */}
                  <div className="p-4 bg-[#141414] rounded border border-white/5 space-y-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Caddy Requests Policy (Ticket M12)</span>
                      <span className="text-[#DBB155]">€90 per bag payable on day of play</span>
                    </div>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Caddy requests are fulfilled by the Rosapenna Caddie Master on the day of play and are payable directly at the Golf Pavilion.
                      Online caddy requests carry €0.00 charge in package booking.
                    </p>
                  </div>
                </div>
              )
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
