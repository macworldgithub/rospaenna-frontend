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
  source_channel: string;
  lead_guest_name: string;
  stay?: {
    arrival_date: string;
    departure_date: string;
    nights: number;
    room_category: string;
    room_quantity: number;
  } | null;
  golf_rounds: Array<{
    course_name: string;
    date: string;
    time: string;
    holes: string;
    players: number;
  }>;
  financials: {
    total_amount: string;
    deposit_paid: string;
    balance_due: string;
    currency: string;
    payment_status: string;
  };
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
