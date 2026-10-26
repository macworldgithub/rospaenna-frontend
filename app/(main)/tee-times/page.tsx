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
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Calendar, Sun, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { COURSES, TeeTime, TeesheetData, PendingBooking, TeesheetCacheInfo } from "@/types/teesheet";

const irelandToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Dublin", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export default function Home() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(irelandToday);
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
  const [cacheInfo, setCacheInfo] = useState<TeesheetCacheInfo | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The date is formatted only after hydration to avoid server/client timezone differences.
    const requestedCourse = new URLSearchParams(window.location.search).get("course");
    if (requestedCourse) {
      // Initialize from the browser URL after hydration; the server cannot read its query here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCourse(requestedCourse);
    }
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

  // Changing filters and refreshing read saved results; they never call BRS.
  const loadTeesheet = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setIsRefreshing(true);
    setLoadError(null);
    setTeesheet(null);
    setCacheInfo(null);
    try {
      const course = COURSES[selectedCourse];
      if (!course) {
        throw new Error(selectedCourse === "st-patricks"
          ? "Online tee times for St Patrick's Links are not available on this page yet. Please contact Reservations."
          : "This course selection is not supported. Please choose Old Tom Morris or Sandy Hills Links.");
      }
      const res = await fetch(
        `/api/teesheet?date=${selectedDate}&course_id=${course.id}`,
        { signal: controller.signal, cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load tee times");
      setTeesheet(json.data as TeesheetData);
      setCacheInfo(json.cache as TeesheetCacheInfo);
    } catch (err) {
      if (controller.signal.aborted) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load tee times");
      setTeesheet(null);
    } finally {
      if (!controller.signal.aborted) setIsRefreshing(false);
    }
  }, [selectedDate, selectedCourse]);

  useEffect(() => {
    if (!mounted) return;
    // Synchronize the selected course/date with an external cached API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTeesheet();
    return () => requestRef.current?.abort();
  }, [mounted, loadTeesheet]);

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
  const teeTimes: TeeTime[] = useMemo(() => teesheet?.tee_times ?? [], [teesheet]);

  const inTimeRange = (time: string) => {
    const hour = parseInt(time.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  };

  /**
   * IMPORTANT: group by `package_name`, not by green-fee `id`.
   * BRS Golf can issue multiple green-fee *records* (different ids) that
   * share the same package name — e.g. a morning off-peak rate and a
   * separate afternoon rate both labeled "Irish Resident". Grouping by id
   * splits those into two identical-looking sections; grouping by name
   * merges them into one, with `ids` tracking every green-fee id that
   * belongs under that heading.
   */
  const packages = useMemo(() => {
    const map = new Map<string, { name: string; description: string; ids: number[] }>();
    for (const t of teeTimes) {
      for (const gf of t.green_fees) {
        if (!gf.package_enabled) continue;
        const existing = map.get(gf.package_name);
        if (existing) {
          if (!existing.ids.includes(gf.id)) existing.ids.push(gf.id);
          // Prefer a non-empty description if the first record we saw had none
          if (!existing.description && gf.package_description) {
            existing.description = gf.package_description;
          }
        } else {
          map.set(gf.package_name, {
            name: gf.package_name,
            description: gf.package_description,
            ids: [gf.id],
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [teeTimes]);

  const availableSlotCount = (t: TeeTime) =>
    Object.values(t.slots).filter((s) => s.status === "Available").length;

  const formatPrice = (price: string | number) => new Intl.NumberFormat("en-IE", {
    style: "currency", currency: teesheet?.currency_code || "EUR",
  }).format(Number(price));

  const priceForPlayers = (gf: TeeTime["green_fees"][number], players: number) => {
    const key = `green_fee${players}_ball` as
      | "green_fee1_ball"
      | "green_fee2_ball"
      | "green_fee3_ball"
      | "green_fee4_ball";
    return gf[key];
  };

  const handleSelectPlayers = (t: TeeTime, gf: TeeTime["green_fees"][number], players: number) => {
    const price = priceForPlayers(gf, players);
    const course = COURSES[selectedCourse];
    if (!price || !course) return;

    let bookingIntentKey = crypto.randomUUID();
    try {
      const previous = JSON.parse(sessionStorage.getItem("pendingBooking") || "null") as PendingBooking | null;
      const sameSelection = previous && previous.date === selectedDate &&
        previous.course?.id === course.id && previous.teeTime?.id === t.id &&
        previous.greenFee?.id === gf.id && previous.players === players &&
        previous.price === price && previous.currency === (teesheet?.currency_code || "EUR");
      if (sameSelection && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(previous.bookingIntentKey)) {
        bookingIntentKey = previous.bookingIntentKey;
      }
    } catch {
      // A fresh key is used when the previous browser selection cannot be read.
    }

    const booking: PendingBooking = {
      bookingIntentKey,
      teeTime: t,
      greenFee: gf,
      course,
      date: selectedDate,
      price,
      players,
      currency: teesheet?.currency_code || "EUR",
    };
    sessionStorage.setItem("pendingBooking", JSON.stringify(booking));
    router.push("/booking");
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
                min={irelandToday()}
                max={cacheInfo?.window_end}
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
                        onChange={() => {
                          setSelectedCourse(value);
                          router.replace(`/tee-times?course=${encodeURIComponent(value)}`, { scroll: false });
                        }}
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

          <div className="border border-[#DBB155]/30 p-4 text-sm text-gray-300 rounded-[3px]" role="status">
            {cacheInfo ? <>
              Last updated {new Date(cacheInfo.fetched_at).toLocaleString("en-IE", { timeZone: "Europe/Dublin" })} (Ireland time).
              {cacheInfo.stale && " The latest daily update is delayed; these are the last saved results."}
              <span className="block mt-1">Availability and prices will be checked again before you proceed with your booking.</span>
            </> : "Tee times are updated daily. Availability and prices are checked again before booking."}
          </div>

          {/* Today's Message */}
          {showTodaysMessage && !!teesheet?.messages?.length && (
            <div className="bg-[#0a0a0a] border border-[#DBB155]/30 p-5 relative text-sm rounded-[3px]">
              <button
                onClick={() => setShowTodaysMessage(false)}
                className="absolute top-3 right-3 text-[#DBB155] hover:text-[#c9a04a] transition-colors"
              >
                <X className="w-5 h-5 bg-[#DBB155] text-black rounded-full p-1" />
              </button>
              <div className="font-bold text-[#DBB155] mb-2 text-[13px]">Today&apos;s Message</div>
              <div className="text-gray-400 leading-relaxed text-[13px]">
                {teesheet.messages.map((message, index) => (
                  <p key={index}>{message.time} - {message.message}</p>
                ))}
              </div>
            </div>
          )}

          {loadError && (
            <div role="alert" className="bg-[#2a0f0f] border border-[#d9534f]/40 text-[#d9534f] text-sm p-4 rounded-[3px]">
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
                      const gf = t.green_fees.find((g) => pkg.ids.includes(g.id));
                      return !!gf && !!gf.green_fee1_ball && availableSlotCount(t) >= 1;
                    });

                    if (timesForPackage.length === 0) return null;

                    const startingPrice = Math.min(...timesForPackage.flatMap(t =>
                      t.green_fees.filter(g => pkg.ids.includes(g.id) && g.green_fee1_ball !== null)
                        .map(g => Number(g.green_fee1_ball))
                    ));

                    return (
                      <div key={pkg.name}>
                        <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                          <span className="text-[#DBB155]">{pkg.name}</span>
                          <span className="text-white">
                            From {formatPrice(startingPrice)}
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
                              const gf = t.green_fees.find((g) => pkg.ids.includes(g.id))!;
                              const key = `${pkg.name}-${t.id}`;
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
                                          {p} PLAYER — {formatPrice(price!)}
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

                  {!isRefreshing && packages.length === 0 && !loadError && (
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
