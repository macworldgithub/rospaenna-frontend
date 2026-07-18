// "use client";

// import {
//   useState,
//   useRef,
//   useEffect,
//   MouseEvent as ReactMouseEvent,
// } from "react";
// import { useRouter } from "next/navigation";
// import { Calendar, Sun, X } from "lucide-react";
// import Sidebar from "@/components/Sidebar";

// export default function Home() {
//   const router = useRouter();
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<string>("2026-06-16");
//   const [mounted, setMounted] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<string>("old-tom-morris");
//   const [showTodaysMessage, setShowTodaysMessage] = useState<boolean>(true);
//   const [viewPackages, setViewPackages] = useState<boolean>(true);
//   const [groupBy, setGroupBy] = useState<string>("price");
//   const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
//   const [minTime, setMinTime] = useState<number>(5);
//   const [maxTime, setMaxTime] = useState<number>(20);
//   const [activeThumb, setActiveThumb] = useState<"left" | "right" | null>(null);

//   const dateInputRef = useRef<HTMLInputElement>(null);
//   const sliderRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "Select a date";
//     const date = new Date(dateString + "T00:00:00");
//     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const dayName = days[date.getDay()];
//     const monthName = months[date.getMonth()];
//     const day = date.getDate();
//     const suffix =
//       day === 1 || day === 21 || day === 31 ? "st"
//       : day === 2 || day === 22 ? "nd"
//       : day === 3 || day === 23 ? "rd"
//       : "th";
//     return `${dayName} ${day}${suffix} ${monthName}`;
//   };

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!activeThumb || !sliderRef.current) return;
//       const rect = sliderRef.current.getBoundingClientRect();
//       const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
//       const val = Math.round(5 + percent * 15);
//       if (activeThumb === "left") {
//         setMinTime(Math.min(val, maxTime - 1));
//       } else {
//         setMaxTime(Math.max(val, minTime + 1));
//       }
//     };
//     const handleMouseUp = () => setActiveThumb(null);
//     if (activeThumb) {
//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//     }
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [activeThumb, minTime, maxTime]);

//   const formatSliderTime = (val: number) => `${val.toString().padStart(2, "0")}:00`;

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     setTimeout(() => setIsRefreshing(false), 800);
//   };

//   const standardTimesRaw = ["07:30","08:00","08:10","09:40","09:50","11:10","11:50","12:00","14:30","14:40","14:50","15:00","15:10","15:20"];
//   const irishTimesRaw   = ["07:30","08:00","08:10","09:40","09:50","11:10","11:50","12:00","14:30","14:40","14:50","15:00","15:10","15:20"];

//   const standardTimes = standardTimesRaw.filter((t) => {
//     const hour = parseInt(t.split(":")[0], 10);
//     return hour >= minTime && hour <= maxTime;
//   });
//   const irishTimes = irishTimesRaw.filter((t) => {
//     const hour = parseInt(t.split(":")[0], 10);
//     return hour >= minTime && hour <= maxTime;
//   });

//   /* ── shared class helpers ── */
//   const toggleActive = "bg-[#DBB155] text-black";
//   const toggleInactive = "text-gray-500 hover:bg-[#DBB155]/10 hover:text-[#DBB155] transition-colors";

//   return (
//     <div className="max-w-[1400px] mx-auto px-6 py-8">
//       <div className="flex flex-col lg:flex-row gap-6">

//         {/* ── Left Column – Filters ── */}
//         <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
//           <div className="border border-[#DBB155]/20 bg-[#0a0a0a]">

//             {/* Date Picker */}
//             <div
//               className="relative bg-[#111111] p-4 border-b border-[#DBB155]/20 flex justify-between items-center hover:bg-[#1a1a1a] transition-colors cursor-pointer"
//               onClick={() => {
//                 try { dateInputRef.current?.showPicker(); }
//                 catch { dateInputRef.current?.focus(); }
//               }}
//             >
//               <span className="text-white font-medium text-sm">
//                 {mounted ? formatDate(selectedDate) : "Tuesday 16th June"}
//               </span>
//               <Calendar className="w-5 h-5 text-[#DBB155]" />
//               <input
//                 ref={dateInputRef}
//                 type="date"
//                 className="absolute left-0 top-0 w-0 h-0 opacity-0"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>

//             <div className="p-5 flex flex-col gap-6">

//               {/* Time Slider */}
//               <div>
//                 <div className="flex justify-between text-[11px] text-gray-400 mb-2">
//                   <span>Time</span>
//                   <span>{formatSliderTime(minTime)} - {formatSliderTime(maxTime)}</span>
//                 </div>
//                 <div ref={sliderRef} className="relative h-1 bg-[#333] rounded-full mt-3 select-none">
//                   <div
//                     className="absolute h-full bg-[#DBB155] rounded-full"
//                     style={{
//                       left: `${((minTime - 5) / 15) * 100}%`,
//                       right: `${100 - ((maxTime - 5) / 15) * 100}%`,
//                     }}
//                   />
//                   <div
//                     className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#DBB155] rounded-full border-2 border-black shadow cursor-pointer z-10"
//                     style={{ left: `calc(${((minTime - 5) / 15) * 100}% - 7px)` }}
//                     onMouseDown={() => setActiveThumb("left")}
//                     onTouchStart={() => setActiveThumb("left")}
//                   />
//                   <div
//                     className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#DBB155] rounded-full border-2 border-black shadow cursor-pointer z-10"
//                     style={{ left: `calc(${((maxTime - 5) / 15) * 100}% - 7px)` }}
//                     onMouseDown={() => setActiveThumb("right")}
//                     onTouchStart={() => setActiveThumb("right")}
//                   />
//                 </div>
//               </div>

//               {/* Holes Toggle */}
//               <div className="flex bg-[#111] rounded-[3px] border border-[#DBB155]/20 overflow-hidden text-xs font-bold">
//                 <button className={`flex-1 py-2.5 ${toggleActive}`}>18 Holes</button>
//                 <button className={`flex-1 py-2.5 ${toggleInactive}`}>9 Holes</button>
//               </div>

//               {/* Choose Course */}
//               <div>
//                 <div className="text-[12px] text-gray-400 mb-3">Choose Course</div>
//                 <div className="flex flex-col gap-3">
//                   {[
//                     { value: "old-tom-morris", label: "Old Tom Morris Links" },
//                     { value: "sandy-hills",    label: "Sandy Hills Links"    },
//                   ].map(({ value, label }) => (
//                     <label key={value} className="flex items-center gap-3 cursor-pointer group">
//                       <input
//                         type="radio" name="course" value={value}
//                         checked={selectedCourse === value}
//                         onChange={(e) => setSelectedCourse(e.target.value)}
//                         className="hidden"
//                       />
//                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center p-[2px] ${selectedCourse === value ? "border-[#DBB155]" : "border-gray-600 group-hover:border-[#DBB155]/60"}`}>
//                         {selectedCourse === value && <div className="w-full h-full bg-[#DBB155] rounded-full" />}
//                       </div>
//                       <span className={`text-[13px] ${selectedCourse === value ? "text-[#DBB155]" : "text-gray-400 group-hover:text-gray-200"}`}>
//                         {label}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Group By Toggle */}
//               <div>
//                 <div className="text-[12px] text-gray-400 mb-3">Group Tee Times By</div>
//                 <div className="flex bg-[#111] rounded-[3px] border border-[#DBB155]/20 overflow-hidden text-xs font-bold">
//                   <button onClick={() => setGroupBy("price")} className={`flex-1 py-2.5 ${groupBy === "price" ? toggleActive : toggleInactive}`}>Price</button>
//                   <button onClick={() => setGroupBy("time")}  className={`flex-1 py-2.5 ${groupBy === "time"  ? toggleActive : toggleInactive}`}>Time</button>
//                 </div>
//               </div>

//               {/* Filter Options */}
//               <div>
//                 <div className="text-[12px] text-gray-400 mb-3">Filter Options</div>
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     checked={viewPackages}
//                     onChange={(e) => setViewPackages(e.target.checked)}
//                     className="w-4 h-4 accent-[#DBB155] border-gray-600 rounded"
//                   />
//                   <span className="text-[13px] text-gray-300 group-hover:text-white">View Packages</span>
//                 </label>
//               </div>

//               {/* Refresh Button */}
//               <button
//                 onClick={handleRefresh}
//                 disabled={isRefreshing}
//                 className="w-full py-3 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-[#DBB155]/40 transition-colors text-black font-bold text-xs tracking-wider uppercase rounded-[3px] flex justify-center items-center gap-2"
//               >
//                 {isRefreshing ? (
//                   <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   "Refresh Tee Times"
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Sunrise / Sunset */}
//           <div className="bg-gradient-to-r from-[#b8860b] to-[#c9a04a] rounded-[3px] p-5 flex justify-between items-center text-black">
//             <div className="text-center">
//               <div className="font-semibold text-sm">Sunrise</div>
//               <div className="font-bold text-lg">04:50</div>
//             </div>
//             <Sun className="w-10 h-10 text-black/60" strokeWidth={1.5} />
//             <div className="text-center">
//               <div className="font-semibold text-sm">Sunset</div>
//               <div className="font-bold text-lg">22:13</div>
//             </div>
//           </div>
//         </div>

//         {/* ── Middle Column – Tee Times ── */}
//         <div className="flex-1 flex flex-col gap-6">

//           {/* Today's Message */}
//           {selectedCourse === "old-tom-morris" && showTodaysMessage && (
//             <div className="bg-[#0a0a0a] border border-[#DBB155]/30 p-5 relative text-sm rounded-[3px]">
//               <button
//                 onClick={() => setShowTodaysMessage(false)}
//                 className="absolute top-3 right-3 text-[#DBB155] hover:text-[#c9a04a] transition-colors"
//               >
//                 <X className="w-5 h-5 bg-[#DBB155] text-black rounded-full p-1" />
//               </button>
//               <div className="font-bold text-[#DBB155] mb-2 text-[13px]">Today's Message</div>
//               <div className="text-gray-400 leading-relaxed text-[13px]">
//                 <span className="font-bold text-gray-200">06:00 - Irish Resident Rate</span>{" "}
//                 - please note this rate is for selected off peak tee times.
//                 Additional peak tee times (Standard Visitor times) will become
//                 bookable within 28 days of your selected date of play, if they
//                 remain available.
//               </div>
//             </div>
//           )}

//           {viewPackages && (
//             <>
//               {isRefreshing ? (
//                 <div className="w-full py-20 flex justify-center items-center">
//                   <div className="w-8 h-8 border-4 border-[#DBB155] border-t-transparent rounded-full animate-spin" />
//                 </div>
//               ) : (
//                 <>
//                   {/* Section 1 – Standard Visitor */}
//                   <div>
//                     <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
//                       <span className="text-[#DBB155]">
//                         1. Standard Visitor —{" "}
//                         {selectedCourse === "old-tom-morris" ? "Old Tom Morris" : "Sandy Hills Links"}
//                       </span>
//                       <span className="text-white">From €200.00</span>
//                     </div>
//                     <div className="bg-[#0a0a0a] border-x border-b border-[#DBB155]/20 p-5 rounded-b-[3px]">
//                       <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 relative">
//                         {standardTimes.map((time) => (
//                           <div key={`std-${time}`} className="relative group">
//                             <button
//                               onClick={() => setActiveDropdown(activeDropdown === `std-${time}` ? null : `std-${time}`)}
//                               className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors ${activeDropdown === `std-${time}` ? "bg-[#c9a04a] text-black" : "bg-[#DBB155] hover:bg-[#c9a04a] text-black"}`}
//                             >
//                               {time}
//                             </button>

//                             {activeDropdown === `std-${time}` && (
//                               <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-[#111] border border-[#DBB155]/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[3px] p-1 flex flex-col gap-1">
//                                 <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-[#111] border-t border-l border-[#DBB155]/30 transform rotate-45" />
//                                 {[
//                                   { p: 1, price: 200 }, { p: 2, price: 400 },
//                                   { p: 3, price: 600 }, { p: 4, price: 800 },
//                                 ].map(({ p, price }) => (
//                                   <button
//                                     key={p}
//                                     onClick={() => router.push(`/booking?players=${p}&price=${price}`)}
//                                     className="bg-[#DBB155] hover:bg-[#c9a04a] text-black py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] transition-colors w-full"
//                                   >
//                                     {p} PLAYER — €{price}.00
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Section 2 – Irish Resident */}
//                   <div>
//                     <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
//                       <span className="text-[#DBB155]">
//                         2. Irish Resident —{" "}
//                         {selectedCourse === "old-tom-morris" ? "Old Tom Morris" : "Sandy Hills Links"}
//                       </span>
//                       <span className="text-white">From €90.00</span>
//                     </div>
//                     <div className="bg-[#0a0a0a] border-x border-b border-[#DBB155]/20 p-5 rounded-b-[3px]">
//                       <p className="text-gray-400 text-[13px] mb-5 leading-relaxed">
//                         Irish driving licence or N Ireland driving licence as well as a Golf Ireland / iGolf Index required to qualify
//                         for this rate. Both will be subject to verification on arrival, see terms &amp; conditions below for further detail.
//                       </p>
//                       <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 relative">
//                         {irishTimes.map((time) => (
//                           <div key={`irish-${time}`} className="relative group">
//                             <button
//                               onClick={() => setActiveDropdown(activeDropdown === `irish-${time}` ? null : `irish-${time}`)}
//                               className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors ${activeDropdown === `irish-${time}` ? "bg-[#c9a04a] text-black" : "bg-[#DBB155] hover:bg-[#c9a04a] text-black"}`}
//                             >
//                               {time}
//                             </button>

//                             {activeDropdown === `irish-${time}` && (
//                               <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-[#111] border border-[#DBB155]/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[3px] p-1 flex flex-col gap-1">
//                                 <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-[#111] border-t border-l border-[#DBB155]/30 transform rotate-45" />
//                                 {[
//                                   { p: 1, price: 90  }, { p: 2, price: 180 },
//                                   { p: 3, price: 270 }, { p: 4, price: 360 },
//                                 ].map(({ p, price }) => (
//                                   <button
//                                     key={p}
//                                     onClick={() => router.push(`/booking?players=${p}&price=${price}`)}
//                                     className="bg-[#DBB155] hover:bg-[#c9a04a] text-black py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] transition-colors w-full"
//                                   >
//                                     {p} PLAYER — €{price}.00
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </>
//           )}
//         </div>

//         {/* ── Right Column – Sidebar ── */}
//         <Sidebar />
//       </div>
//     </div>
//   );
// }

"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Calendar, Sun, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";

/* ─────────────────────────────────────────────────────────
   BRS Golf API config
   NOTE: cf_clearance / session / XSRF values rotate and will
   go stale — replace these when the teesheet call starts
   returning 401/403.
   ───────────────────────────────────────────────────────── */
const BRS_BASE_URL = "https://visitors.brsgolf.com";

const BRS_COOKIE =
  "cf_clearance=lRJuXx52wzJ8A6TVaxSthavcRKJq9Q9nH52wsApQwj0-1784383001-1.2.1.1-FFP4pStZSKR3gwrbPZFMskRgFutPbD9.sFgMrnWqqRkNEzhPkn.TqjZVbCy4Vy0obQ3SQeRkdjQfJjW450O8BlR3f6eVXbhBuE8r1nlHCMhSDyzh5UX9o2RhWflseQoZhCBJzKcI186jDD4fd74sIQhKVTiv6Ceb7hmcZYVuXtS5Q18mcqNbfZpAkScvQpUVEMQhTXsVA2.VK2RfAI1Fpm95K4FHoITbvMMmPZFXLdlOr8Se7S4aM2ikmcwoYQkaIImaKnjbeKqLYiF248A_xe1WN8JhhbJpqISCUv8qakqptKMqehfjxepcB2bF4QM3IZyMuwNB36tWHcGRv55uAg; BRSVisitors.Session=CfDJ8Pz8nKtcOS5LgAJRASVshiFehRQ5RfEYnMUWokxscLMb5O%2BmDDCKIFX5WqS44nB7sSJtoUJQg57eC2ii3VtdTFLHxE8Kd2Y4wjt5zpc1kgkgHRLKDnQcu1fBy%2BzTV2UR%2F67rM7%2BHCX8Ibz%2FTwTGCY7Ofug3eWhgyh6YdQV8OHYTt; .AspNetCore.Antiforgery.-pRt6Pu6weQ=CfDJ8Pz8nKtcOS5LgAJRASVshiFoGMHfQ2DOsWmqksQZvIIzdl1jaO1Fq2r0OsOeFZeBfLaidq9Tk2S7lcIjKqcRTGUYgftaHTLkaNVfQmb6KHjf_MIIrOT3WJD7e-LEnX4HC0Fix9KrGnfUU1ODsivjNBc; XSRF-TOKEN=CfDJ8Pz8nKtcOS5LgAJRASVshiEXFKBNxsKN-pW63cgEO3RPIOSY_EvgDq6X5IqJ1GezkVaTkvGu8NbE22AAqaL_1SBcmRKIGX_D7Knby36MYULMA-xUdT29uOq6zPP-O-hMLJiQkSDbxxkLL3gP3QZvC_A; XSRF-TOKEN=CfDJ8Pz8nKtcOS5LgAJRASVshiG-ogmhNWsOt98_2du6yhix-T1QBYezF0uKnwP7d5Mk2CBgr2mrm3rhL4TlTDFnFk8fUKLION6XqARG7XG6yjQZcOgILQaLhAhAjG9VLyQCjC8yd3YwxIDG8yYVFAV3tSw; __cflb=04dToSf1KA8B29VXv6DPNxPeGEySYLJAN9bSrkpF64";

const BRS_XSRF_TOKEN =
  "CfDJ8Pz8nKtcOS5LgAJRASVshiEXFKBNxsKN-pW63cgEO3RPIOSY_EvgDq6X5IqJ1GezkVaTkvGu8NbE22AAqaL_1SBcmRKIGX_D7Knby36MYULMA-xUdT29uOq6zPP-O-hMLJiQkSDbxxkLL3gP3QZvC_A";

const brsHeaders = () => ({
  Accept: "application/json, text/plain, */*",
  Referer: `${BRS_BASE_URL}/rosapenna`,
  "X-Requested-With": "XMLHttpRequest",
  "X-XSRF-TOKEN": BRS_XSRF_TOKEN,
  Cookie: BRS_COOKIE, // browsers will silently strip/refuse this — see note above
});

/* ── Types (kept in this file per your request — no separate files) ── */
interface GreenFee {
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

interface SlotStatus {
  status: string;
  name_on_teesheet: string | null;
}

interface TeeTime {
  id: number;
  time: string;
  holes: string;
  num_holes: number | null;
  slots: Record<string, SlotStatus>;
  green_fees: GreenFee[];
  is_hot_deal: boolean;
  buggies_available: boolean | null;
}

interface TeesheetData {
  tee_times: TeeTime[];
  title: string;
  tee_date: string;
  sunrise: string;
  sunset: string;
  currency_code: string;
  messages: string[];
}

interface Course {
  id: number;
  facilities_id: number;
  name: string;
  playing_time: string;
  colour: string;
}

// ⚠️ course_id for "Old Tom Morris Links" is unverified — your curl only
// confirmed course_id=3 => Sandy Hills Links. Update this once you know it.
const COURSES: Record<string, Course> = {
  "old-tom-morris": {
    id: 1,
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

export default function Home() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-19");
  const [mounted, setMounted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("old-tom-morris");
  const [showTodaysMessage, setShowTodaysMessage] = useState<boolean>(true);
  const [viewPackages, setViewPackages] = useState<boolean>(true);
  const [groupBy, setGroupBy] = useState<string>("price");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [minTime, setMinTime] = useState<number>(5);
  const [maxTime, setMaxTime] = useState<number>(20);
  const [activeThumb, setActiveThumb] = useState<"left" | "right" | null>(null);

  const [teesheet, setTeesheet] = useState<TeesheetData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Select a date";
    const date = new Date(dateString + "T00:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31 ? "st"
      : day === 2 || day === 22 ? "nd"
      : day === 3 || day === 23 ? "rd"
      : "th";
    return `${dayName} ${day}${suffix} ${monthName}`;
  };

  /* ── Direct client-side call to BRS Golf teesheet API ── */
  const loadTeesheet = async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const course = COURSES[selectedCourse];
      const url = `${BRS_BASE_URL}/api/casualBooking/teesheet?date=${selectedDate}&course_id=${course.id}`;

      const res = await fetch(url, {
        method: "GET",
        headers: brsHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Teesheet request failed: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      setTeesheet(json.data as TeesheetData);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? `${err.message} (if this is a CORS or "refused to set header" error in the console, the browser is blocking the cookie/cross-origin call — this endpoint needs to be called from a server, not the browser)`
          : "Failed to load tee times"
      );
      setTeesheet(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    loadTeesheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, selectedDate, selectedCourse]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeThumb || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const val = Math.round(5 + percent * 15);
      if (activeThumb === "left") {
        setMinTime(Math.min(val, maxTime - 1));
      } else {
        setMaxTime(Math.max(val, minTime + 1));
      }
    };
    const handleMouseUp = () => setActiveThumb(null);
    if (activeThumb) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, minTime, maxTime]);

  const formatSliderTime = (val: number) => `${val.toString().padStart(2, "0")}:00`;

  const handleRefresh = () => {
    loadTeesheet();
  };

  /* ── Derive packages + filtered tee times from live data ── */
  const teeTimes: TeeTime[] = teesheet?.tee_times ?? [];

  const inTimeRange = (time: string) => {
    const hour = parseInt(time.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  };

  const packages = useMemo(() => {
    const map = new Map<number, { id: number; name: string; description: string }>();
    for (const t of teeTimes) {
      for (const gf of t.green_fees) {
        if (gf.package_enabled && !map.has(gf.id)) {
          map.set(gf.id, {
            id: gf.id,
            name: gf.package_name,
            description: gf.package_description,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [teeTimes]);

  const availableSlotCount = (t: TeeTime) =>
    Object.values(t.slots).filter((s) => s.status === "Available").length;

  const priceForPlayers = (gf: GreenFee, players: number) => {
    const key = `green_fee${players}_ball` as
      | "green_fee1_ball"
      | "green_fee2_ball"
      | "green_fee3_ball"
      | "green_fee4_ball";
    return gf[key];
  };

  const handleSelectPlayers = (t: TeeTime, gf: GreenFee, players: number) => {
    const price = priceForPlayers(gf, players);
    if (!price) return;

    const booking: PendingBooking = {
      teeTime: t,
      greenFee: gf,
      course: COURSES[selectedCourse],
      date: selectedDate,
      price,
      players,
    };
    sessionStorage.setItem("pendingBooking", JSON.stringify(booking));
    router.push(`/booking?players=${players}&price=${price}`);
  };

  const toggleActive = "bg-[#DBB155] text-black";
  const toggleInactive = "text-gray-500 hover:bg-[#DBB155]/10 hover:text-[#DBB155] transition-colors";

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left Column – Filters ── */}
        <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <div className="border border-[#DBB155]/20 bg-[#0a0a0a]">

            {/* Date Picker */}
            <div
              className="relative bg-[#111111] p-4 border-b border-[#DBB155]/20 flex justify-between items-center hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              onClick={() => {
                try { dateInputRef.current?.showPicker(); }
                catch { dateInputRef.current?.focus(); }
              }}
            >
              <span className="text-white font-medium text-sm">
                {mounted ? formatDate(selectedDate) : "Loading..."}
              </span>
              <Calendar className="w-5 h-5 text-[#DBB155]" />
              <input
                ref={dateInputRef}
                type="date"
                className="absolute left-0 top-0 w-0 h-0 opacity-0"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="p-5 flex flex-col gap-6">

              {/* Time Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                  <span>Time</span>
                  <span>{formatSliderTime(minTime)} - {formatSliderTime(maxTime)}</span>
                </div>
                <div ref={sliderRef} className="relative h-1 bg-[#333] rounded-full mt-3 select-none">
                  <div
                    className="absolute h-full bg-[#DBB155] rounded-full"
                    style={{
                      left: `${((minTime - 5) / 15) * 100}%`,
                      right: `${100 - ((maxTime - 5) / 15) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#DBB155] rounded-full border-2 border-black shadow cursor-pointer z-10"
                    style={{ left: `calc(${((minTime - 5) / 15) * 100}% - 7px)` }}
                    onMouseDown={() => setActiveThumb("left")}
                    onTouchStart={() => setActiveThumb("left")}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#DBB155] rounded-full border-2 border-black shadow cursor-pointer z-10"
                    style={{ left: `calc(${((maxTime - 5) / 15) * 100}% - 7px)` }}
                    onMouseDown={() => setActiveThumb("right")}
                    onTouchStart={() => setActiveThumb("right")}
                  />
                </div>
              </div>

              {/* Holes Toggle */}
              <div className="flex bg-[#111] rounded-[3px] border border-[#DBB155]/20 overflow-hidden text-xs font-bold">
                <button className={`flex-1 py-2.5 ${toggleActive}`}>18 Holes</button>
                <button className={`flex-1 py-2.5 ${toggleInactive}`}>9 Holes</button>
              </div>

              {/* Choose Course */}
              <div>
                <div className="text-[12px] text-gray-400 mb-3">Choose Course</div>
                <div className="flex flex-col gap-3">
                  {Object.entries(COURSES).map(([value, course]) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio" name="course" value={value}
                        checked={selectedCourse === value}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center p-[2px] ${selectedCourse === value ? "border-[#DBB155]" : "border-gray-600 group-hover:border-[#DBB155]/60"}`}>
                        {selectedCourse === value && <div className="w-full h-full bg-[#DBB155] rounded-full" />}
                      </div>
                      <span className={`text-[13px] ${selectedCourse === value ? "text-[#DBB155]" : "text-gray-400 group-hover:text-gray-200"}`}>
                        {course.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group By Toggle */}
              <div>
                <div className="text-[12px] text-gray-400 mb-3">Group Tee Times By</div>
                <div className="flex bg-[#111] rounded-[3px] border border-[#DBB155]/20 overflow-hidden text-xs font-bold">
                  <button onClick={() => setGroupBy("price")} className={`flex-1 py-2.5 ${groupBy === "price" ? toggleActive : toggleInactive}`}>Price</button>
                  <button onClick={() => setGroupBy("time")}  className={`flex-1 py-2.5 ${groupBy === "time"  ? toggleActive : toggleInactive}`}>Time</button>
                </div>
              </div>

              {/* Filter Options */}
              <div>
                <div className="text-[12px] text-gray-400 mb-3">Filter Options</div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={viewPackages}
                    onChange={(e) => setViewPackages(e.target.checked)}
                    className="w-4 h-4 accent-[#DBB155] border-gray-600 rounded"
                  />
                  <span className="text-[13px] text-gray-300 group-hover:text-white">View Packages</span>
                </label>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full py-3 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-[#DBB155]/40 transition-colors text-black font-bold text-xs tracking-wider uppercase rounded-[3px] flex justify-center items-center gap-2"
              >
                {isRefreshing ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Refresh Tee Times"
                )}
              </button>
            </div>
          </div>

          {/* Sunrise / Sunset */}
          <div className="bg-gradient-to-r from-[#b8860b] to-[#c9a04a] rounded-[3px] p-5 flex justify-between items-center text-black">
            <div className="text-center">
              <div className="font-semibold text-sm">Sunrise</div>
              <div className="font-bold text-lg">{teesheet?.sunrise ?? "--:--"}</div>
            </div>
            <Sun className="w-10 h-10 text-black/60" strokeWidth={1.5} />
            <div className="text-center">
              <div className="font-semibold text-sm">Sunset</div>
              <div className="font-bold text-lg">{teesheet?.sunset ?? "--:--"}</div>
            </div>
          </div>
        </div>

        {/* ── Middle Column – Tee Times ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Today's Message */}
          {selectedCourse === "old-tom-morris" && showTodaysMessage && (
            <div className="bg-[#0a0a0a] border border-[#DBB155]/30 p-5 relative text-sm rounded-[3px]">
              <button
                onClick={() => setShowTodaysMessage(false)}
                className="absolute top-3 right-3 text-[#DBB155] hover:text-[#c9a04a] transition-colors"
              >
                <X className="w-5 h-5 bg-[#DBB155] text-black rounded-full p-1" />
              </button>
              <div className="font-bold text-[#DBB155] mb-2 text-[13px]">Today's Message</div>
              <div className="text-gray-400 leading-relaxed text-[13px]">
                <span className="font-bold text-gray-200">06:00 - Irish Resident Rate</span>{" "}
                - please note this rate is for selected off peak tee times.
                Additional peak tee times (Standard Visitor times) will become
                bookable within 28 days of your selected date of play, if they
                remain available.
              </div>
            </div>
          )}

          {loadError && (
            <div className="bg-[#2a0f0f] border border-[#d9534f]/40 text-[#d9534f] text-sm p-4 rounded-[3px]">
              {loadError}
            </div>
          )}

          {viewPackages && (
            <>
              {isRefreshing ? (
                <div className="w-full py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-[#DBB155] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {packages.map((pkg) => {
                    const timesForPackage = teeTimes.filter((t) => {
                      if (!inTimeRange(t.time)) return false;
                      const gf = t.green_fees.find((g) => g.id === pkg.id);
                      return !!gf && !!gf.green_fee1_ball && availableSlotCount(t) >= 1;
                    });

                    if (timesForPackage.length === 0) return null;

                    const firstGf = timesForPackage[0].green_fees.find((g) => g.id === pkg.id)!;

                    return (
                      <div key={pkg.id}>
                        <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                          <span className="text-[#DBB155]">{pkg.name}</span>
                          <span className="text-white">
                            From €{parseFloat(firstGf.green_fee1_ball!).toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-[#0a0a0a] border-x border-b border-[#DBB155]/20 p-5 rounded-b-[3px]">
                          {pkg.description && (
                            <p className="text-gray-400 text-[13px] mb-5 leading-relaxed">
                              {pkg.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                            {timesForPackage.map((t) => {
                              const gf = t.green_fees.find((g) => g.id === pkg.id)!;
                              const key = `${pkg.id}-${t.id}`;
                              const maxPlayers = availableSlotCount(t);
                              const options = [1, 2, 3, 4]
                                .filter((p) => p <= maxPlayers)
                                .map((p) => ({ p, price: priceForPlayers(gf, p) }))
                                .filter((o) => !!o.price);

                              return (
                                <div key={key} className="relative group">
                                  <button
                                    onClick={() =>
                                      setActiveDropdown(activeDropdown === key ? null : key)
                                    }
                                    className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors ${activeDropdown === key ? "bg-[#c9a04a] text-black" : "bg-[#DBB155] hover:bg-[#c9a04a] text-black"}`}
                                  >
                                    {t.time}
                                  </button>

                                  {activeDropdown === key && (
                                    <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-[#111] border border-[#DBB155]/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[3px] p-1 flex flex-col gap-1">
                                      <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-[#111] border-t border-l border-[#DBB155]/30 transform rotate-45" />
                                      {options.map(({ p, price }) => (
                                        <button
                                          key={p}
                                          onClick={() => handleSelectPlayers(t, gf, p)}
                                          className="bg-[#DBB155] hover:bg-[#c9a04a] text-black py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] transition-colors w-full"
                                        >
                                          {p} PLAYER — €{parseFloat(price!).toFixed(2)}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {packages.length === 0 && !loadError && (
                    <div className="text-gray-500 text-sm py-10 text-center">
                      No tee times available for this date/course.
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Right Column – Sidebar ── */}
        <Sidebar />
      </div>
    </div>
  );
}
