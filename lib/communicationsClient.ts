/**
 * Client library for guest communications, itinerary retrieval, and special requests.
 */

export interface SendEmailPayload {
  booking_intent_id: string;
  template: "booking_confirmation" | "special_request_acknowledgement" | "one_time_code" | "balance_reminder";
  recipient_email?: string;
  recipient_name?: string;
  otp_code?: string;
  special_request_text?: string;
  idempotency_key?: string;
}

export interface EmailDeliveryResponse {
  success: boolean;
  delivery_id: string;
  template: string;
  recipient: string;
  hotel_notified: boolean;
  pdf_attached: boolean;
  subject: string;
  status: "sent" | "queued" | "simulated_sandbox" | "failed";
  sent_at: string;
  error_message?: string | null;
  idempotency_replayed?: boolean;
}

export interface SpecialRequestPayload {
  booking_intent_id: string;
  request_text: string;
  category?: "dietary" | "room_preference" | "accessibility" | "other";
}

export interface SpecialRequestResponse {
  status: string;
  booking_reference: string;
  category: string;
  request_text: string;
  review_status: string;
  inventory_mutated: boolean;
  payment_mutated: boolean;
  delivery_result: EmailDeliveryResponse;
}

/**
 * Dispatch an email notification via the Next.js BFF communications endpoint.
 */
export async function dispatchEmailCommunication(payload: SendEmailPayload): Promise<EmailDeliveryResponse> {
  const response = await fetch("/api/communications/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = data?.error || data?.detail || `Email dispatch failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as EmailDeliveryResponse;
}

/**
 * Submit guest special request; recorded as pending staff review without altering inventory or payments.
 */
export async function submitSpecialRequest(payload: SpecialRequestPayload): Promise<SpecialRequestResponse> {
  const response = await fetch("/api/communications/special-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = data?.error || data?.detail || `Special request submission failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as SpecialRequestResponse;
}

/**
 * Returns the API download endpoint URL for the rendered PDF itinerary document.
 */
export function getItineraryPdfUrl(bookingIntentId: string): string {
  return `/api/communications/itinerary/${encodeURIComponent(bookingIntentId)}`;
}
