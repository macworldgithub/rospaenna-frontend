"use client";

import {
  useState,
  useRef,
  useEffect,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Calendar, Sun, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-16");
  const [mounted, setMounted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("old-tom-morris");
  const [showTodaysMessage, setShowTodaysMessage] = useState<boolean>(true);
  const [viewPackages, setViewPackages] = useState<boolean>(true);
  const [groupBy, setGroupBy] = useState<string>("price");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [minTime, setMinTime] = useState<number>(5);
  const [maxTime, setMaxTime] = useState<number>(20);
  const [activeThumb, setActiveThumb] = useState<"left" | "right" | null>(null);

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
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const standardTimesRaw = ["07:30","08:00","08:10","09:40","09:50","11:10","11:50","12:00","14:30","14:40","14:50","15:00","15:10","15:20"];
  const irishTimesRaw   = ["07:30","08:00","08:10","09:40","09:50","11:10","11:50","12:00","14:30","14:40","14:50","15:00","15:10","15:20"];

  const standardTimes = standardTimesRaw.filter((t) => {
    const hour = parseInt(t.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  });
  const irishTimes = irishTimesRaw.filter((t) => {
    const hour = parseInt(t.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  });

  /* ── shared class helpers ── */
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
                {mounted ? formatDate(selectedDate) : "Tuesday 16th June"}
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
                  {[
                    { value: "old-tom-morris", label: "Old Tom Morris Links" },
                    { value: "sandy-hills",    label: "Sandy Hills Links"    },
                  ].map(({ value, label }) => (
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
                        {label}
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
              <div className="font-bold text-lg">04:50</div>
            </div>
            <Sun className="w-10 h-10 text-black/60" strokeWidth={1.5} />
            <div className="text-center">
              <div className="font-semibold text-sm">Sunset</div>
              <div className="font-bold text-lg">22:13</div>
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

          {viewPackages && (
            <>
              {isRefreshing ? (
                <div className="w-full py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-[#DBB155] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Section 1 – Standard Visitor */}
                  <div>
                    <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                      <span className="text-[#DBB155]">
                        1. Standard Visitor —{" "}
                        {selectedCourse === "old-tom-morris" ? "Old Tom Morris" : "Sandy Hills Links"}
                      </span>
                      <span className="text-white">From €200.00</span>
                    </div>
                    <div className="bg-[#0a0a0a] border-x border-b border-[#DBB155]/20 p-5 rounded-b-[3px]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                        {standardTimes.map((time) => (
                          <div key={`std-${time}`} className="relative group">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === `std-${time}` ? null : `std-${time}`)}
                              className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors ${activeDropdown === `std-${time}` ? "bg-[#c9a04a] text-black" : "bg-[#DBB155] hover:bg-[#c9a04a] text-black"}`}
                            >
                              {time}
                            </button>

                            {activeDropdown === `std-${time}` && (
                              <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-[#111] border border-[#DBB155]/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[3px] p-1 flex flex-col gap-1">
                                <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-[#111] border-t border-l border-[#DBB155]/30 transform rotate-45" />
                                {[
                                  { p: 1, price: 200 }, { p: 2, price: 400 },
                                  { p: 3, price: 600 }, { p: 4, price: 800 },
                                ].map(({ p, price }) => (
                                  <button
                                    key={p}
                                    onClick={() => router.push(`/booking?players=${p}&price=${price}`)}
                                    className="bg-[#DBB155] hover:bg-[#c9a04a] text-black py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] transition-colors w-full"
                                  >
                                    {p} PLAYER — €{price}.00
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 2 – Irish Resident */}
                  <div>
                    <div className="bg-[#1a1510] border border-[#DBB155]/30 px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                      <span className="text-[#DBB155]">
                        2. Irish Resident —{" "}
                        {selectedCourse === "old-tom-morris" ? "Old Tom Morris" : "Sandy Hills Links"}
                      </span>
                      <span className="text-white">From €90.00</span>
                    </div>
                    <div className="bg-[#0a0a0a] border-x border-b border-[#DBB155]/20 p-5 rounded-b-[3px]">
                      <p className="text-gray-400 text-[13px] mb-5 leading-relaxed">
                        Irish driving licence or N Ireland driving licence as well as a Golf Ireland / iGolf Index required to qualify
                        for this rate. Both will be subject to verification on arrival, see terms &amp; conditions below for further detail.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                        {irishTimes.map((time) => (
                          <div key={`irish-${time}`} className="relative group">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === `irish-${time}` ? null : `irish-${time}`)}
                              className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors ${activeDropdown === `irish-${time}` ? "bg-[#c9a04a] text-black" : "bg-[#DBB155] hover:bg-[#c9a04a] text-black"}`}
                            >
                              {time}
                            </button>

                            {activeDropdown === `irish-${time}` && (
                              <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-[#111] border border-[#DBB155]/30 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[3px] p-1 flex flex-col gap-1">
                                <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-[#111] border-t border-l border-[#DBB155]/30 transform rotate-45" />
                                {[
                                  { p: 1, price: 90  }, { p: 2, price: 180 },
                                  { p: 3, price: 270 }, { p: 4, price: 360 },
                                ].map(({ p, price }) => (
                                  <button
                                    key={p}
                                    onClick={() => router.push(`/booking?players=${p}&price=${price}`)}
                                    className="bg-[#DBB155] hover:bg-[#c9a04a] text-black py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] transition-colors w-full"
                                  >
                                    {p} PLAYER — €{price}.00
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
