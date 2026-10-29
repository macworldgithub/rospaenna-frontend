export interface GreenFee {
  id: number;
  green_fee1_ball: string | null;
  green_fee2_ball: string | null;
  green_fee3_ball: string | null;
  green_fee4_ball: string | null;
  num_holes: string;
  type: string;
  package_enabled: boolean;
  package_name: string;
  package_description: string;
  package_has_food_icon: boolean;
  package_has_buggies_icon: boolean;
  package_has_accommodation_icon: boolean;
}

export interface SlotStatus {
  status: "Available" | "Booked" | string;
  name_on_teesheet: string | null;
}

export interface TeeTime {
  id: number;
  time: string;
  holes: string;
  num_holes: number | null;
  slots: Record<string, SlotStatus>;
  green_fees: GreenFee[];
  is_hot_deal: boolean;
  buggies_available: boolean | null;
}

export interface TeesheetData {
  tee_times: TeeTime[];
  title: string;
  tee_date: string;
  sunrise: string;
  sunset: string;
  currency_code: string;
  messages: { start_date: string; end_date: string; time: string; message: string }[];
}

export interface TeesheetCacheInfo {
  fetched_at: string;
  stale: boolean;
  window_start: string;
  window_end: string;
  live?: boolean;
  storage?: string;
  ttl_seconds?: number;
}

export interface Course {
  id: number;
  facilities_id: number;
  name: string;
  playing_time: string;
  colour: string;
}

export const COURSES: Record<string, Course> = {
  "old-tom-morris": {
    id: 1,
    facilities_id: 5797,
    name: "Old Tom Morris Links",
    playing_time: "4h 15m",
    colour: "",
  },
  "sandy-hills": {
    id: 3,
    facilities_id: 5896,
    name: "Sandy Hills Links",
    playing_time: "4h 30m",
    colour: "3",
  },
  "st-patricks": {
    id: 4,
    facilities_id: 5897,
    name: "St Patrick's Links",
    playing_time: "4h 30m",
    colour: "4",
  },
};

export interface PendingBooking {
  bookingIntentKey: string;
  teeTime: TeeTime;
  greenFee: GreenFee;
  course: Course;
  date: string;
  price: string;
  players: number;
  currency: string;
}
