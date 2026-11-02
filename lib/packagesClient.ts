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
  residence_country?: string | null;
  has_golf_ireland_index?: boolean;
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
  rate_basis?: string;
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
  terms_version?: string;
  deposit_percent?: number;
  balance_percent?: number;
  rate_basis_summary?: string;
  is_golf_ireland_eligible?: boolean;
  amendment_summary?: AmendmentPaymentSummary | null;
  reserves_inventory: boolean;
  freshness_ttl_seconds: number;
  expires_at?: string;
  created_at: string;
  errors: string[];
}

export interface PackagePaymentLinkRequest {
  quote_id: string;
  lead_first_name: string;
  lead_last_name: string;
  lead_email: string;
  lead_phone: string;
  residence_country?: string;
  accepted_terms: boolean;
  special_requests?: string | null;
}

export interface PackagePaymentLinkResponse {
  payment_id: string;
  booking_intent_id: string;
  booking_reference: string;
  quote_id: string;
  rules_version: string;
  amount: string;
  currency: string;
  status: "draft" | "unpaid" | "pending" | "verified_paid" | "failed" | "expired";
  payment_url: string;
  expires_at: string;
  reminder_at: string;
  reserves_inventory: boolean;
  created_at: string;
}

export interface PaymentCallbackRequest {
  payment_id: string;
  transaction_id: string;
  status: "paid" | "completed" | "failed" | "cancelled" | "expired";
  amount: string;
  currency?: string;
  timestamp: number;
  provider_signature: string;
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

export interface PackageSearchRequest {
  arrival_date: string;
  departure_date: string;
  party_size?: number;
  room_count?: number;
  bed_type?: "TWIN" | "DOUBLE" | "SINGLE";
  preferred_room_category?: string | null;
  preferred_courses?: number[];
  residence_country?: string | null;
  has_golf_ireland_index?: boolean;
}

export interface AvailableRoomCategoryOption {
  room_category: string;
  category_name: string;
  available_rooms: number;
  rate_per_night: string;
  subtotal: string;
  breakfast_included: boolean;
  is_available: boolean;
}

export interface AvailableTeeSlotOption {
  time: string;
  available_slots: number;
  rate_per_player: string;
  is_hot_deal?: boolean;
}

export interface DailyCourseTeeTimes {
  date: string;
  course_id: number;
  course_name: string;
  is_closed: boolean;
  closure_reason?: string | null;
  alternative_suggestion?: string | null;
  available_slots_count: number;
  tee_slots: AvailableTeeSlotOption[];
}

export interface RecommendedPackageOption {
  name: string;
  room_category: string;
  selected_courses: string[];
  total_price: string;
  deposit_amount: string;
  balance_amount: string;
  balance_due_date: string;
}

export interface PackageSearchResponse {
  search_id: string;
  status: "available" | "ineligible" | "unavailable" | "partial";
  arrival_date: string;
  departure_date: string;
  nights: number;
  party_size: number;
  room_count: number;
  is_golf_ireland_eligible: boolean;
  required_minimum_rounds: number;
  room_options: AvailableRoomCategoryOption[];
  daily_golf_options: DailyCourseTeeTimes[];
  recommended_packages: RecommendedPackageOption[];
  warnings: string[];
  reserves_inventory: boolean;
  freshness_ttl_seconds: number;
  created_at: string;
}

/**
 * Server functions calling the FastAPI backend directly.
 */
export async function fetchPackageQuote(
  request: PackageQuoteRequest
): Promise<PackageQuoteResponse> {
  return bookingBackend<PackageQuoteResponse>("/packages/quote", request, {}, "POST");
}

export async function fetchPackageQuoteById(
  quoteId: string
): Promise<PackageQuoteResponse> {
  return bookingBackend<PackageQuoteResponse>(`/packages/quote/${encodeURIComponent(quoteId)}`, undefined, {}, "GET");
}

export async function createPackagePaymentLink(
  request: PackagePaymentLinkRequest
): Promise<PackagePaymentLinkResponse> {
  return bookingBackend<PackagePaymentLinkResponse>("/packages/payment-link", request, {}, "POST");
}

export async function fetchPaymentRecord(
  paymentId: string
): Promise<PackagePaymentLinkResponse> {
  return bookingBackend<PackagePaymentLinkResponse>(`/packages/payments/${encodeURIComponent(paymentId)}`, undefined, {}, "GET");
}

export async function submitPaymentCallback(
  request: PaymentCallbackRequest
): Promise<PackagePaymentLinkResponse> {
  return bookingBackend<PackagePaymentLinkResponse>("/packages/payment-callback", request, {}, "POST");
}

export async function searchStayAndGolf(
  request: PackageSearchRequest
): Promise<PackageSearchResponse> {
  return bookingBackend<PackageSearchResponse>("/packages/search", request, {}, "POST");
}

export async function fetchPackageRules(): Promise<PackageRulesConfig> {
  return bookingBackend<PackageRulesConfig>("/packages/rules", undefined, {}, "GET");
}

export async function updatePackageRules(
  request: UpdatePackageRulesRequest
): Promise<PackageRulesConfig> {
  return bookingBackend<PackageRulesConfig>("/packages/rules", request, {}, "PUT");
}
