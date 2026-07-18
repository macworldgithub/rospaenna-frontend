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
  messages: string[];
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
    id: 1, // ⚠️ unverified — confirm the real course_id for Old Tom Morris Links
    facilities_id: 5896,
    name: "Old Tom Morris Links",
    playing_time: "",
    colour: "1",
  },
  "sandy-hills": {
    id: 3,
    facilities_id: 5896,
    name: "Sandy Hills Links",
    playing_time: "",
    colour: "3",
  },
};

export interface PendingBooking {
  teeTime: TeeTime;
  greenFee: GreenFee;
  course: Course;
  date: string;
  price: string;
  players: number;
}