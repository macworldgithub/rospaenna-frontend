import { bookingBackend } from "./bookingBackend";

export interface RoomSelectionQuoteRequest {
  room_category: string;
  room_quantity?: number;
  adults?: number;
  children?: number;
}

export interface GolfRoundQuoteRequest {
  course_id: number;
  date: string;
  time: string;
  players: number;
}

export interface PackageQuoteRequest {
  arrival_date: string;
  departure_date: string;
  rooms: RoomSelectionQuoteRequest[];
  golf_rounds: GolfRoundQuoteRequest[];
  existing_booking_intent_id?: string | null;
}

export interface ItemizedRoomQuote {
  room_category: string;
  room_quantity: number;
  nights: number;
  rate_per_night: string;
  subtotal: string;
  rate_plan_code: string;
  breakfast_included: boolean;
  available_rooms: number;
}

export interface ItemizedGolfRoundQuote {
  course_id: number;
  course_name: string;
  date: string;
  time: string;
  players: number;
  rate_per_player: string;
  subtotal: string;
  available_slots: number;
}

export interface AmendmentPaymentSummary {
  current_total: string;
  revised_total: string;
  verified_paid: string;
  amount_difference: string;
  balance_due: string;
  credit_amount: string;
}

export interface PackageQuoteResponse {
  quote_id: string;
  status: "available" | "ineligible" | "unavailable";
  rules_version: string;
  arrival_date: string;
  departure_date: string;
  nights: number;
  currency: string;
  itemized_rooms: ItemizedRoomQuote[];
  itemized_golf: ItemizedGolfRoundQuote[];
  total_rooms_price: string;
  total_golf_price: string;
  total_package_price: string;
  deposit_amount: string;
  balance_amount: string;
  balance_due_date: string;
  amendment_summary?: AmendmentPaymentSummary | null;
  reserves_inventory: boolean;
  freshness_ttl_seconds: number;
  created_at: string;
  errors: string[];
}

export interface MinimumRoundsRule {
  minimum_nights: number;
  maximum_nights: number;
  rounds: number;
}

export interface PackageRulesConfig {
  version: string;
  effective_date: string;
  total_hotel_rooms: number;
  bookable_cap: number;
  category_buffers: Record<string, number>;
  deposit_percent: number;
  balance_percent: number;
  balance_due_weeks: number;
  minimum_rounds: MinimumRoundsRule[];
  closures: Record<string, unknown>[];
}

export interface UpdatePackageRulesRequest {
  actor: string;
  reason: string;
  effective_date: string;
  bookable_cap?: number;
  category_buffers?: Record<string, number>;
  deposit_percent?: number;
  balance_due_weeks?: number;
}

/**
 * Fetch a live, server-verified Stay & Play package quote from the backend pricing engine.
 */
export async function fetchPackageQuote(
  request: PackageQuoteRequest
): Promise<PackageQuoteResponse> {
  return bookingBackend<PackageQuoteResponse>("/packages/quote", request, {}, "POST");
}

/**
 * Fetch active package rules configuration from the backend.
 */
export async function fetchPackageRules(): Promise<PackageRulesConfig> {
  return bookingBackend<PackageRulesConfig>("/packages/rules", undefined, {}, "GET");
}

/**
 * Update package rules configuration with an immutable audit record.
 */
export async function updatePackageRules(
  request: UpdatePackageRulesRequest
): Promise<PackageRulesConfig> {
  return bookingBackend<PackageRulesConfig>("/packages/rules", request, {}, "PUT");
}
