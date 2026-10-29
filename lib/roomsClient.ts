import { bookingBackend } from "./bookingBackend";

export interface RoomOccupant {
  first_name: string;
  last_name: string;
  is_primary?: boolean;
}

export interface DateSharingAssignment {
  date: string;
  occupant_names: string[];
  bed_type_preference?: "TWIN" | "DOUBLE" | "SINGLE";
  notes?: string;
}

export interface CreateReservationRequest {
  booking_intent_id: string;
  arrival_date: string;
  departure_date: string;
  room_category: string;
  room_quantity?: number;
  room_group_id?: string;
  rate_plan_code?: string;
  adults?: number;
  children?: number;
  occupants: RoomOccupant[];
  sharing_assignments?: DateSharingAssignment[];
  guest_phone?: string;
  guest_email?: string;
  special_requests?: string;
  idempotency_key?: string;
}

export interface UpdateReservationRequest {
  reservation_id: string;
  expected_revision?: number;
  arrival_date?: string;
  departure_date?: string;
  room_category?: string;
  room_quantity?: number;
  room_group_id?: string;
  occupants?: RoomOccupant[];
  sharing_assignments?: DateSharingAssignment[];
  guest_phone?: string;
  guest_email?: string;
  special_requests?: string;
  idempotency_key?: string;
}

export interface ReservationWriteResult {
  reservation_id: string;
  confirmation_number: string;
  status: string;
  hotel_id: string;
  arrival_date: string;
  departure_date: string;
  room_category: string;
  room_quantity: number;
  room_group_id?: string;
  occupants: RoomOccupant[];
  sharing_assignments: DateSharingAssignment[];
  total_amount: number;
  currency: string;
  source: string;
  verified_via_readback: boolean;
  idempotency_replayed: boolean;
  created_at: string;
}

export interface RoomReservationDetail {
  reservation_id: string;
  confirmation_number?: string;
  hotel_id: string;
  status: string;
  arrival_date: string;
  departure_date: string;
  room_category: string;
  room_quantity: number;
  room_group_id?: string;
  room_number?: string | null;
  occupants: RoomOccupant[];
  sharing_assignments: DateSharingAssignment[];
  total_amount: number;
  currency: string;
  source: string;
  retrieved_at: string;
}

export interface RoomAvailabilityResponse {
  hotel_id: string;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  source: string;
  categories: {
    room_category: string;
    category_name: string;
    available_rooms: number;
    rates: {
      rate_plan_code: string;
      rate_plan_name: string;
      total_amount: number;
      currency: string;
      breakfast_included: boolean;
    }[];
  }[];
}

export async function fetchRoomAvailability(
  arrivalDate: string,
  departureDate: string,
  adults = 2,
  children = 0
): Promise<RoomAvailabilityResponse> {
  const query = new URLSearchParams({
    arrival_date: arrivalDate,
    departure_date: departureDate,
    adults: String(adults),
    children: String(children),
  });
  return bookingBackend<RoomAvailabilityResponse>(`/rooms/availability?${query.toString()}`);
}

export async function fetchRoomReservation(reservationId: string): Promise<RoomReservationDetail> {
  return bookingBackend<RoomReservationDetail>(`/rooms/reservations/${encodeURIComponent(reservationId)}`);
}

export async function createRoomReservation(
  request: CreateReservationRequest
): Promise<ReservationWriteResult> {
  return bookingBackend<ReservationWriteResult>("/rooms/reservations", request, {}, "POST");
}

export async function amendRoomReservation(
  reservationId: string,
  request: UpdateReservationRequest
): Promise<ReservationWriteResult> {
  return bookingBackend<ReservationWriteResult>(
    `/rooms/reservations/${encodeURIComponent(reservationId)}`,
    request,
    {},
    "PUT"
  );
}
