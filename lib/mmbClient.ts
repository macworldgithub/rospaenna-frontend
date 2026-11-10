/**
 * Client library for Manage My Booking (MMB) authentication and booking session operations.
 */

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  cooldown_seconds?: number;
  error?: string;
}

export interface MmbSessionResponse {
  session_token: string;
  booking_reference: string;
  token_type: string;
  expires_at: string;
}

export interface VerifyOtpResult {
  success: boolean;
  session?: MmbSessionResponse;
  error?: string;
}

export interface MmbBookingSummary {
  booking_reference: string;
  booking_revision?: number;
  source_channel: string;
  lead_guest_name: string;
  lead_guest_email?: string;
  stay?: {
    arrival_date: string;
    departure_date: string;
    nights: number;
    room_category: string;
    room_quantity: number;
    assigned_room_number?: string | null;
    occupant_names?: string[];
    meal_plan?: string;
    source_status?: "confirmed" | "unavailable" | "stale";
    last_synced_at?: string;
  } | null;
  golf_rounds: Array<{
    course_name: string;
    date: string;
    time: string;
    holes: string;
    players: number;
    caddy_request_status?: string | null;
    source_status?: "confirmed" | "unavailable" | "stale";
  }>;
  financials: {
    total_amount: string;
    deposit_paid: string;
    balance_due: string;
    currency: string;
    payment_status: string;
    balance_due_date?: string | null;
    ledger_verified?: boolean;
    payments_count?: number;
  };
  pending_requests?: Array<{
    request_id: string;
    request_type: string;
    description: string;
    status: "pending_review" | "under_review" | "approved" | "declined";
    submitted_at: string;
    notes?: string;
  }>;
  sources_health?: Record<
    string,
    {
      status: "confirmed" | "unavailable" | "stale" | "partial";
      message: string;
      last_synced_at?: string;
    }
  >;
  data_freshness_timestamp?: string;
  status: string;
}

export async function requestOtp(
  booking_reference: string,
  last_name: string
): Promise<RequestOtpResponse> {
  const res = await fetch("/api/mmb/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_reference: booking_reference.trim().toUpperCase(),
      last_name: last_name.trim(),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      message: data.error || data.detail || "Unable to request verification code.",
      error: data.error || data.detail || "Request failed",
    };
  }

  return {
    success: true,
    message: data.message || "A verification code has been dispatched.",
    cooldown_seconds: data.cooldown_seconds || 60,
  };
}

export async function verifyOtp(
  booking_reference: string,
  code: string
): Promise<VerifyOtpResult> {
  const res = await fetch("/api/mmb/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_reference: booking_reference.trim().toUpperCase(),
      code: code.trim(),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: data.error || data.detail || "Invalid or expired verification code.",
    };
  }

  return {
    success: true,
    session: data.session || data,
  };
}

export async function fetchAuthenticatedBooking(
  booking_reference: string,
  session_token: string
): Promise<{ success: boolean; booking?: MmbBookingSummary; error?: string }> {
  const res = await fetch(`/api/mmb/booking/${encodeURIComponent(booking_reference.trim().toUpperCase())}`, {
    headers: {
      "X-MMB-Session": session_token.trim(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: data.error || data.detail || "Unable to fetch booking details.",
    };
  }

  return {
    success: true,
    booking: data.booking || data,
  };
}

export async function logoutMmbSession(
  session_token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/mmb/auth/logout", {
      method: "POST",
      headers: {
        "X-MMB-Session": session_token.trim(),
      },
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, error: data.error };
  } catch {
    return { success: false, error: "Network error during sign out." };
  }
}

export interface ProposedGolfRoundSearch {
  course_id?: number;
  course_name?: string;
  date: string;
  time_window?: string;
  players?: number;
}

export interface MmbAmendmentSearchRequest {
  booking_reference: string;
  proposed_arrival_date?: string;
  proposed_departure_date?: string;
  proposed_room_category?: string;
  proposed_room_quantity?: number;
  proposed_golf_rounds?: ProposedGolfRoundSearch[];
  requested_notes?: string;
}

export interface ProposedStayOption {
  arrival_date: string;
  departure_date: string;
  nights: number;
  room_category: string;
  room_quantity: number;
  is_available: boolean;
  own_allocation_retained: boolean;
  nightly_rate: string;
  stay_total: string;
  rate_plan_code?: string;
  breakfast_included?: boolean;
  source_freshness: string;
}

export interface ProposedGolfRoundOption {
  course_id?: number;
  course_name: string;
  date: string;
  time: string;
  players: number;
  holes: string;
  round_price_total: string;
  is_available: boolean;
  own_allocation_retained?: boolean;
  source_freshness: string;
}

export interface AmendmentPricingComparison {
  original_package_total: string;
  new_package_total: string;
  price_delta: string;
  deposit_already_paid: string;
  revised_balance_due: string;
  currency?: string;
}

export interface AmendmentOptionAlternative {
  option_id: string;
  title: string;
  description: string;
  stay_option: ProposedStayOption;
  golf_options: ProposedGolfRoundOption[];
  pricing_comparison: AmendmentPricingComparison;
  eligibility_checks?: Record<string, boolean>;
  is_complete_package: boolean;
  unavailability_reasons: string[];
}

export interface MmbAmendmentSearchResponse {
  booking_reference: string;
  search_id: string;
  searched_at: string;
  current_itinerary?: MmbBookingSummary;
  is_complete_itinerary_available: boolean;
  alternatives: AmendmentOptionAlternative[];
  sources_freshness: Record<string, { status: string; message: string; last_synced_at?: string }>;
  warnings: string[];
  reserves_inventory: boolean;
  error?: string;
}

export async function searchAmendmentOptions(
  request: MmbAmendmentSearchRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: MmbAmendmentSearchResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/search", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to search amendment options.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error during amendment search.";
    return {
      success: false,
      error: message,
    };
  }
}

export interface AmendmentOfferCreateRequest {
  booking_reference: string;
  option_id: string;
  proposed_stay: ProposedStayOption;
  proposed_golf_rounds: ProposedGolfRoundOption[];
}

export interface AmendmentOfferAcceptRequest {
  offer_id: string;
  booking_reference: string;
  terms_version: string;
  accepted_terms: boolean;
  occupant_review_acknowledged?: boolean;
}

export interface AmendmentOfferSnapshot {
  offer_id: string;
  booking_reference: string;
  booking_revision: number;
  option_id: string;
  current_itinerary: MmbBookingSummary;
  proposed_stay: ProposedStayOption;
  proposed_golf_rounds: ProposedGolfRoundOption[];
  pricing_comparison: AmendmentPricingComparison;
  credit_amount: string;
  amount_due_now: string;
  balance_due_date: string;
  amendment_fee: string;
  requires_occupant_review: boolean;
  occupant_review_acknowledged: boolean;
  terms_version: string;
  status: "pending_consent" | "accepted" | "expired" | "invalidated" | "committed";
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
  reserves_inventory: boolean;
}

export async function createAmendmentOffer(
  request: AmendmentOfferCreateRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: AmendmentOfferSnapshot; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/offer", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to generate amendment offer.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error creating amendment offer.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getAmendmentOffer(
  offerId: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: AmendmentOfferSnapshot; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/amendments/offer/${encodeURIComponent(offerId)}`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch amendment offer.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching amendment offer.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function acceptAmendmentOffer(
  request: AmendmentOfferAcceptRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: AmendmentOfferSnapshot; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/offer/accept", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to accept amendment offer.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error accepting amendment offer.";
    return {
      success: false,
      error: message,
    };
  }
}

export interface AmendmentRevalidationComponentCheck {
  component: "hotel_rooms" | "golf_rounds" | "pricing_ledger" | "booking_revision" | "terms_acceptance";
  status: "passed" | "failed" | "stale" | "indeterminate";
  message: string;
  checked_at: string;
}

export interface AmendmentRevalidationRequest {
  booking_reference: string;
  offer_id: string;
  idempotency_key?: string;
  simulate_sold_out_room?: boolean;
  simulate_unavailable_tee?: boolean;
  simulate_rate_change?: string;
}

export interface AmendmentRevalidationResponse {
  revalidation_id: string;
  offer_id: string;
  booking_reference: string;
  is_valid: boolean;
  revalidation_status:
    | "valid"
    | "room_unavailable"
    | "tee_time_unavailable"
    | "price_changed"
    | "ledger_changed"
    | "revision_conflict"
    | "offer_expired"
    | "unaccepted_offer"
    | "gate_disabled";
  summary_message: string;
  checks: AmendmentRevalidationComponentCheck[];
  refreshed_offer?: AmendmentOfferSnapshot | null;
  revalidated_at: string;
  reserves_inventory: boolean;
  idempotency_key?: string | null;
}

export async function revalidateAmendmentOffer(
  request: AmendmentRevalidationRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: AmendmentRevalidationResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/revalidate", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to revalidate amendment offer.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error revalidating amendment offer.";
    return {
      success: false,
      error: message,
    };
  }
}

export type AmendmentPaymentActionType = "payment_required" | "zero_due" | "credit_generated";
export type AmendmentSettlementStatus =
  | "payment_link_created"
  | "zero_due_authorized"
  | "credit_recorded"
  | "paid_unconfirmed";

export interface AmendmentPaymentInitiateRequest {
  booking_reference: string;
  offer_id: string;
  revalidation_id: string;
  idempotency_key?: string;
}

export interface AmendmentPaymentInitiateResponse {
  booking_reference: string;
  offer_id: string;
  revalidation_id: string;
  action_type: AmendmentPaymentActionType;
  settlement_status: AmendmentSettlementStatus;
  payment_id?: string | null;
  payment_url?: string | null;
  amount_due_now: string;
  credit_amount: string;
  currency: string;
  expires_at?: string | null;
  message: string;
  reserves_inventory: boolean;
  idempotency_key?: string | null;
  created_at: string;
}

export async function initiateAmendmentSettlement(
  request: AmendmentPaymentInitiateRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: AmendmentPaymentInitiateResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/settlement/initiate", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to initiate amendment settlement.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error initiating amendment settlement.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getAmendmentPaymentStatus(
  paymentId: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/amendments/settlement/payment/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch amendment payment status.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching amendment payment status.";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Ticket M10: Room Occupants, Sharing, and Moves
// ============================================================================

export type BedPreferenceType = "TWIN" | "DOUBLE" | "SINGLE";
export type OccupantUpdateStatus = "confirmed" | "pending_staff_review" | "conflict" | "invalidated";

export interface OccupantDetail {
  occupant_id?: string | null;
  first_name: string;
  last_name: string;
  is_primary?: boolean;
  room_group_id: string;
  effective_from: string; // YYYY-MM-DD
  effective_to: string;   // YYYY-MM-DD
}

export interface SharingPreference {
  room_group_id: string;
  bed_type_preference: BedPreferenceType;
  notes?: string | null;
  sharing_with?: string | null;
}

export interface BookedRoomGroupSummary {
  room_group_id: string;
  room_category: string;
  capacity: number;
  assigned_occupants: string[];
  sharing_preference?: SharingPreference | null;
}

export interface OccupantRosterResponse {
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  room_quantity: number;
  room_groups: BookedRoomGroupSummary[];
  occupants: OccupantDetail[];
  sharing_preferences: SharingPreference[];
  unassigned_physical_room_notice: string;
  version_hash: string;
  revision: number;
  pending_amendment_review: boolean;
  active_amendment_offer_id?: string | null;
}

export interface OccupantUpdateRequest {
  booking_reference: string;
  expected_revision?: number | null;
  occupants: OccupantDetail[];
  sharing_preferences?: SharingPreference[];
  idempotency_key?: string | null;
  amendment_offer_id?: string | null;
}

export interface OccupantUpdateResponse {
  booking_reference: string;
  status: OccupantUpdateStatus;
  version_hash: string;
  revision: number;
  occupants: OccupantDetail[];
  sharing_preferences: SharingPreference[];
  readback_verified: boolean;
  unassigned_physical_room_notice: string;
  amendment_offer_id?: string | null;
  message: string;
}

export async function fetchOccupantRoster(
  bookingReference: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: OccupantRosterResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/occupants/${encodeURIComponent(bookingReference.trim().toUpperCase())}`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch room occupants roster.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching occupant roster.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateOccupantRoster(
  bookingReference: string,
  request: OccupantUpdateRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: OccupantUpdateResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/occupants/${encodeURIComponent(bookingReference.trim().toUpperCase())}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to update occupant roster.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error updating occupant roster.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function reviewOccupantsForAmendment(
  bookingReference: string,
  request: OccupantUpdateRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: OccupantUpdateResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/occupants/${encodeURIComponent(bookingReference.trim().toUpperCase())}/review-for-amendment`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to review occupants for amendment.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error reviewing occupants for amendment.";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Ticket M09: Confirmed Amendment Commit
// ============================================================================

export interface MmbAmendmentCommitRequest {
  booking_reference: string;
  offer_id: string;
  revalidation_id: string;
  payment_id?: string | null;
  idempotency_key: string;
}

export interface MmbAmendmentCommitResponse {
  operation_id: string;
  booking_reference: string;
  offer_id: string;
  status: "confirmed" | "unconfirmed_reconciliation" | "pending_payment";
  stage: string;
  message: string;
  readback_verified: boolean;
  staff_review_required: boolean;
  replayed: boolean;
  new_booking_revision?: number | null;
  email_delivery_id?: string | null;
  committed_at?: string | null;
  error?: string;
}

export async function commitAmendment(
  request: MmbAmendmentCommitRequest,
  sessionToken?: string
): Promise<{ success: boolean; data?: MmbAmendmentCommitResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch("/api/mmb/amendments/commit", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to commit amendment.",
        data: json.data,
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error committing amendment.";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Ticket M11: Guest Phone Updates
// ============================================================================

export interface GuestPhoneReadResponse {
  booking_reference: string;
  lead_guest_name: string;
  phone_number?: string | null;
  masked_phone: string;
  booking_revision: number;
  contact_version: string;
  source_status: "confirmed" | "unavailable";
  read_at: string;
}

export interface GuestPhoneUpdateRequest {
  phone_number: string;
  expected_revision: number;
  contact_version?: string | null;
}

export interface GuestPhoneUpdateResponse {
  operation_id: string;
  booking_reference: string;
  phone_number: string;
  masked_phone: string;
  booking_revision: number;
  contact_version: string;
  status: "confirmed" | "reconciliation_required" | "conflict" | "rejected";
  verified_via_readback: boolean;
  staff_review_required: boolean;
  replayed: boolean;
  message: string;
  updated_at: string;
}

export async function fetchGuestPhone(
  bookingReference: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: GuestPhoneReadResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/contact/${encodeURIComponent(bookingReference.trim().toUpperCase())}/phone`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch guest phone contact details.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching guest phone contact.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateGuestPhone(
  bookingReference: string,
  request: GuestPhoneUpdateRequest,
  sessionToken?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: GuestPhoneUpdateResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    headers["Idempotency-Key"] = key;

    const res = await fetch(`/api/mmb/contact/${encodeURIComponent(bookingReference.trim().toUpperCase())}/phone`, {
      method: "PUT",
      headers,
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to update guest phone number.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error updating guest phone number.";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Ticket M12: Per-Round Caddy Request Updates
// ============================================================================

export type CaddyCategory = "caddie" | "forecaddie";

export interface CaddyBagPreference {
  bag_index: number;
  caddy_category?: CaddyCategory;
  player_name?: string | null;
  notes?: string | null;
}

export interface RoundCaddySummary {
  round_id: string;
  course_id: number;
  course_name: string;
  date: string;
  time: string;
  holes: string;
  players: number;
  caddies_requested: number;
  caddy_category?: CaddyCategory | null;
  caddy_request_status: string;
  bag_preferences: CaddyBagPreference[];
  general_notes?: string | null;
  online_charge: string;
  estimated_day_fee: string;
  notice: string;
}

export interface BookingCaddyRosterResponse {
  booking_reference: string;
  booking_revision: number;
  rounds: RoundCaddySummary[];
  general_notice: string;
  read_at: string;
}

export interface RoundCaddyUpdateRequest {
  booking_reference: string;
  round_id: string;
  caddies_requested: number;
  caddy_category?: CaddyCategory | null;
  bag_preferences?: CaddyBagPreference[];
  general_notes?: string | null;
  expected_revision: number;
  payment_terms?: "payable_on_the_day";
}

export interface RoundCaddyUpdateResponse {
  operation_id: string;
  booking_reference: string;
  round_id: string;
  caddies_requested: number;
  caddy_category?: CaddyCategory | null;
  caddy_request_status: string;
  bag_preferences: CaddyBagPreference[];
  general_notes?: string | null;
  booking_revision: number;
  online_charge: string;
  estimated_day_fee: string;
  verified_via_readback: boolean;
  replayed: boolean;
  message: string;
  notice: string;
  updated_at: string;
}

export async function fetchBookingCaddyRoster(
  bookingReference: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: BookingCaddyRosterResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(`/api/mmb/caddy/${encodeURIComponent(bookingReference.trim().toUpperCase())}`, {
      method: "GET",
      headers,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch caddy request roster.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching caddy request roster.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateRoundCaddyRequest(
  bookingReference: string,
  roundId: string,
  request: RoundCaddyUpdateRequest,
  sessionToken?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: RoundCaddyUpdateResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_cad_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    headers["Idempotency-Key"] = key;

    const res = await fetch(
      `/api/mmb/caddy/${encodeURIComponent(bookingReference.trim().toUpperCase())}/rounds/${encodeURIComponent(
        roundId.trim()
      )}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(request),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to update caddy request.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error updating caddy request.";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Ticket M13: Special and Cancellation Requests
// ============================================================================

export type SpecialRequestCategory =
  | "dietary"
  | "room_preference"
  | "golf_preference"
  | "accessibility"
  | "cancellation_inquiry"
  | "general_inquiry"
  | "other";

export type RequestType = "special_request" | "cancellation_request";

export type RequestReviewStatus =
  | "pending_review"
  | "under_review"
  | "needs_information"
  | "rejected"
  | "approved_awaiting_implementation"
  | "completed"
  | "approved"
  | "declined"
  | "cancelled";

export interface GuestSpecialRequestCreate {
  booking_reference: string;
  request_type: RequestType;
  category: SpecialRequestCategory;
  request_text: string;
  desired_dates?: string | null;
  desired_room_category?: string | null;
  desired_golf_notes?: string | null;
  expected_revision?: number | null;
}

export interface GuestSpecialRequestItem {
  request_id: string;
  booking_reference: string;
  request_type: RequestType;
  category: SpecialRequestCategory;
  request_text: string;
  desired_dates?: string | null;
  desired_room_category?: string | null;
  desired_golf_notes?: string | null;
  status: RequestReviewStatus;
  submitted_at: string;
  notes?: string | null;
  email_delivery_id?: string | null;
  email_delivery_status?: string | null;
}

export interface GuestSpecialRequestResponse {
  request_id: string;
  booking_reference: string;
  request_type: RequestType;
  category: SpecialRequestCategory;
  status: RequestReviewStatus;
  submitted_at: string;
  booking_revision: number;
  replayed: boolean;
  inventory_mutated: boolean;
  payment_mutated: boolean;
  email_delivery_status: string;
  email_delivery_id?: string | null;
  message: string;
  notice: string;
}

export interface GuestRequestsListResponse {
  booking_reference: string;
  booking_revision: number;
  requests: GuestSpecialRequestItem[];
  read_at: string;
}

export async function fetchGuestRequests(
  bookingReference: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: GuestRequestsListResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(
      `/api/mmb/requests/${encodeURIComponent(bookingReference.trim().toUpperCase())}`,
      {
        method: "GET",
        headers,
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch guest requests.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching guest requests.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function submitGuestSpecialRequest(
  bookingReference: string,
  request: GuestSpecialRequestCreate,
  sessionToken?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: GuestSpecialRequestResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    headers["Idempotency-Key"] = key;

    const res = await fetch(
      `/api/mmb/requests/${encodeURIComponent(bookingReference.trim().toUpperCase())}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to submit request.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error submitting guest request.";
    return {
      success: false,
      error: message,
    };
  }
}

// ----------------------------------------------------------------------------
// Ticket M14: Staff Request Outcomes Types & Client Methods
// ----------------------------------------------------------------------------

export type StaffRequestOutcomeStatus =
  | "needs_information"
  | "rejected"
  | "approved_awaiting_implementation"
  | "completed";

export type StaffRequestExecutionType =
  | "informational_only"
  | "f14_operation"
  | "vendor_readback_verified";

export interface StaffRequestHistoryEntry {
  history_id: string;
  actor: string;
  timestamp: string;
  prior_status: string;
  new_status: string;
  reason: string;
  internal_notes?: string | null;
  guest_message?: string | null;
  execution_type?: string | null;
  f14_operation_id?: string | null;
  vendor_readback_ref?: string | null;
  cancellation_authorization_ref?: string | null;
  f12_delivery_id?: string | null;
  f12_delivery_status?: string | null;
}

export interface StaffRequestItem {
  request_id: string;
  booking_reference: string;
  request_type: string;
  category: string;
  request_text: string;
  desired_dates?: string | null;
  desired_room_category?: string | null;
  desired_golf_notes?: string | null;
  status: RequestReviewStatus;
  submitted_at: string;
  last_updated_at?: string | null;
  lead_guest_name?: string | null;
  lead_guest_email?: string | null;
  notes?: string | null;
  history: StaffRequestHistoryEntry[];
  f12_delivery_id?: string | null;
  f12_delivery_status?: string | null;
  booking_revision: number;
}

export interface StaffRequestTransitionCreate {
  target_status: StaffRequestOutcomeStatus;
  reason: string;
  internal_notes?: string | null;
  guest_message?: string | null;
  execution_type?: StaffRequestExecutionType | null;
  f14_operation_id?: string | null;
  vendor_readback_ref?: string | null;
  cancellation_authorization_ref?: string | null;
  expected_revision?: number | null;
}

export interface StaffRequestTransitionResponse {
  request_id: string;
  booking_reference: string;
  prior_status: string;
  new_status: string;
  transition_recorded_at: string;
  booking_revision: number;
  f12_delivery_status: string;
  f12_delivery_id?: string | null;
  replayed: boolean;
  message: string;
  notice: string;
}

export interface StaffRequestListResponse {
  total: number;
  requests: StaffRequestItem[];
  read_at: string;
}

export async function fetchStaffRequests(
  staffToken: string,
  filters?: { status?: string; request_type?: string; booking_reference?: string }
): Promise<{ success: boolean; data?: StaffRequestListResponse; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.request_type) params.set("request_type", filters.request_type);
    if (filters?.booking_reference) params.set("booking_reference", filters.booking_reference.trim().toUpperCase());

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/staff/requests${queryStr}`, {
      method: "GET",
      headers: {
        "X-Staff-Token": staffToken.trim(),
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Failed to fetch staff requests.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error listing staff requests.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function transitionStaffRequest(
  staffToken: string,
  bookingReference: string,
  requestId: string,
  payload: StaffRequestTransitionCreate,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: StaffRequestTransitionResponse; error?: string }> {
  try {
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_staff_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    const res = await fetch(
      `/api/staff/requests/${encodeURIComponent(bookingReference.trim().toUpperCase())}/${encodeURIComponent(requestId.trim())}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Staff-Token": staffToken.trim(),
          "Idempotency-Key": key,
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Failed to transition staff request.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error transitioning staff request.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function retryStaffRequestNotification(
  staffToken: string,
  bookingReference: string,
  requestId: string
): Promise<{ success: boolean; data?: StaffRequestTransitionResponse; error?: string }> {
  try {
    const res = await fetch(
      `/api/staff/requests/${encodeURIComponent(bookingReference.trim().toUpperCase())}/${encodeURIComponent(requestId.trim())}/retry`,
      {
        method: "POST",
        headers: {
          "X-Staff-Token": staffToken.trim(),
        },
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Failed to retry notification.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error retrying notification.";
    return {
      success: false,
      error: message,
    };
  }
}

// ----------------------------------------------------------------------------
// Ticket M15: Revised Confirmations, PDF Itineraries, & Pre-Arrival Reminders
// ----------------------------------------------------------------------------

export type ReminderType =
  | "balance_due_first"
  | "rooming_and_caddy"
  | "concierge_check"
  | "balance_due_final";

export type ReminderStatus =
  | "scheduled"
  | "canceled_by_amendment"
  | "suppressed"
  | "dispatched"
  | "failed";

export interface ScheduledReminderItem {
  reminder_id: string;
  booking_reference: string;
  revision_number: number;
  reminder_type: ReminderType;
  title: string;
  scheduled_date: string;
  target_lead_time_days: number;
  status: ReminderStatus;
  suppression_reason?: string | null;
  dispatched_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledReminderListResponse {
  booking_reference: string;
  active_revision: number;
  arrival_date?: string | null;
  balance_due_date?: string | null;
  reminders: ScheduledReminderItem[];
}

export interface RevisedConfirmationSendResponse {
  booking_reference: string;
  revision_number: number;
  delivery_result: {
    success: boolean;
    delivery_id: string;
    template: string;
    recipient: string;
    hotel_notified: boolean;
    pdf_attached: boolean;
    subject: string;
    status: string;
    sent_at: string;
    error_message?: string | null;
    idempotency_replayed?: boolean;
  };
}

export function getRevisedPdfDownloadUrl(bookingReference: string): string {
  return `/api/mmb/confirmations/${encodeURIComponent(bookingReference.trim().toUpperCase())}/pdf`;
}

export async function fetchBookingReminders(
  bookingReference: string,
  sessionToken?: string
): Promise<{ success: boolean; data?: ScheduledReminderListResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }

    const res = await fetch(
      `/api/mmb/confirmations/${encodeURIComponent(bookingReference.trim().toUpperCase())}/reminders`,
      {
        method: "GET",
        headers,
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to fetch scheduled reminders.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error fetching scheduled reminders.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function requestRevisedConfirmationSend(
  bookingReference: string,
  sessionToken?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: RevisedConfirmationSendResponse; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    headers["X-Idempotency-Key"] = key;

    const res = await fetch(
      `/api/mmb/confirmations/${encodeURIComponent(bookingReference.trim().toUpperCase())}/send`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ idempotency_key: key }),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to send revised confirmation email.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error sending revised confirmation.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function dispatchBookingReminder(
  bookingReference: string,
  reminderId: string,
  sessionToken?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken) {
      headers["X-MMB-Session"] = sessionToken.trim();
    }
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idemp_disp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    headers["X-Idempotency-Key"] = key;

    const res = await fetch(
      `/api/mmb/confirmations/${encodeURIComponent(bookingReference.trim().toUpperCase())}/reminders/${encodeURIComponent(reminderId.trim())}/dispatch`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ idempotency_key: key }),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.detail || "Unable to dispatch reminder.",
      };
    }

    return {
      success: true,
      data: json.data || json,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error dispatching reminder.";
    return {
      success: false,
      error: message,
    };
  }
}





