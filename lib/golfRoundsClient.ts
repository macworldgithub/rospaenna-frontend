import { bookingBackend } from "./bookingBackend";

export interface CaddyRequestPayload {
  caddies_requested: number;
  caddy_category?: "caddie" | "forecaddie" | null;
  notes?: string | null;
  payment_terms?: "payable_on_the_day";
  online_charge?: string;
  status?: "requested" | "not_requested";
}

export interface CreateBrsRoundRequest {
  booking_intent_id: string;
  idempotency_key: string;
  round_id?: string;
  course_id: number;
  date: string;
  time: string;
  holes?: string;
  players: number;
  price: string;
  currency?: string;
  package_name?: string;
  caddy_request?: CaddyRequestPayload | null;
}

export interface UpdateBrsRoundRequest {
  booking_intent_id: string;
  idempotency_key: string;
  round_id: string;
  new_course_id?: number;
  new_date?: string;
  new_time?: string;
  new_players?: number;
  new_price?: string;
  caddy_request?: CaddyRequestPayload | null;
}

export interface ReleaseBrsRoundRequest {
  booking_intent_id: string;
  idempotency_key: string;
  round_id: string;
  reason?: string;
}

export interface BrsRoundWriteResult {
  success: boolean;
  round_id: string;
  brs_booking_id: string;
  booking_reference: string;
  course_id: number;
  course_name: string;
  date: string;
  time: string;
  holes: string;
  players: number;
  price: string;
  currency: string;
  status: string;
  caddy_request?: CaddyRequestPayload | null;
  verified_via_readback: boolean;
  source: "brs_live" | "verified_sandbox" | "idempotent_replay";
  created_at: string;
  idempotency_replayed: boolean;
}

export interface BrsRoundReleaseResult {
  success: boolean;
  round_id: string;
  status: "Released" | "Cancelled";
  released_at: string;
  source: "brs_live" | "verified_sandbox";
}

/**
 * Create a new BRS golf round linked to a booking intent.
 */
export async function createGolfRound(
  request: CreateBrsRoundRequest
): Promise<BrsRoundWriteResult> {
  return bookingBackend<BrsRoundWriteResult>("/golf/rounds", request, {
    "Idempotency-Key": request.idempotency_key,
  });
}

/**
 * Amend an existing BRS golf round linked to a booking intent.
 */
export async function amendGolfRound(
  roundId: string,
  request: UpdateBrsRoundRequest
): Promise<BrsRoundWriteResult> {
  return bookingBackend<BrsRoundWriteResult>(
    `/golf/rounds/${encodeURIComponent(roundId)}`,
    request,
    {
      "Idempotency-Key": request.idempotency_key,
    },
    "PUT"
  );
}

/**
 * Release/cancel a BRS golf round linked to a booking intent (F14 coordination).
 */
export async function releaseGolfRound(
  roundId: string,
  request: ReleaseBrsRoundRequest
): Promise<BrsRoundReleaseResult> {
  return bookingBackend<BrsRoundReleaseResult>(
    `/golf/rounds/${encodeURIComponent(roundId)}`,
    request,
    {
      "Idempotency-Key": request.idempotency_key,
    },
    "DELETE"
  );
}
