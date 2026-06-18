"use client";

import {
  useState,
  useRef,
  useEffect,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Calendar, Phone, Mail, MapPin, X, Sun, Info } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-16");
  const [mounted, setMounted] = useState(false);
  const [selectedCourse, setSelectedCourse] =
    useState<string>("old-tom-morris");
  const [showTodaysMessage, setShowTodaysMessage] = useState<boolean>(true);
  const [viewPackages, setViewPackages] = useState<boolean>(true);

  // New States
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
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();

    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";

    return `${dayName} ${day}${suffix} ${monthName}`;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeThumb || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const val = Math.round(5 + percent * 15); // Scale from 5 to 20

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

  const formatSliderTime = (val: number) =>
    `${val.toString().padStart(2, "0")}:00`;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const standardTimesRaw = [
    "07:30",
    "08:00",
    "08:10",
    "09:40",
    "09:50",
    "11:10",
    "11:50",
    "12:00",
    "14:30",
    "14:40",
    "14:50",
    "15:00",
    "15:10",
    "15:20",
  ];
  const irishTimesRaw = [
    "07:30",
    "08:00",
    "08:10",
    "09:40",
    "09:50",
    "11:10",
    "11:50",
    "12:00",
    "14:30",
    "14:40",
    "14:50",
    "15:00",
    "15:10",
    "15:20",
  ];

  const standardTimes = standardTimesRaw.filter((t) => {
    const hour = parseInt(t.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  });

  const irishTimes = irishTimesRaw.filter((t) => {
    const hour = parseInt(t.split(":")[0], 10);
    return hour >= minTime && hour <= maxTime;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Filters */}
        <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <div className="border border-gray-200 bg-white">
            {/* Date Picker */}
            <div
              className="relative bg-[#f9f9f9] p-4 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors overflow-hidden cursor-pointer"
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker();
                } catch (e) {
                  dateInputRef.current?.focus();
                }
              }}
            >
              <span className="text-gray-700 font-medium text-sm">
                {mounted ? formatDate(selectedDate) : "Tuesday 16th June"}
              </span>
              <Calendar className="w-5 h-5 text-gray-500" />
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
                <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                  <span>Time</span>
                  <span>
                    {formatSliderTime(minTime)} - {formatSliderTime(maxTime)}
                  </span>
                </div>
                <div
                  ref={sliderRef}
                  className="relative h-1 bg-gray-300 rounded-full mt-3 select-none"
                >
                  <div
                    className="absolute h-full bg-[#3a4550] rounded-full"
                    style={{
                      left: `${((minTime - 5) / 15) * 100}%`,
                      right: `${100 - ((maxTime - 5) / 15) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#3a4550] rounded-full border-2 border-white shadow-sm cursor-pointer z-10"
                    style={{
                      left: `calc(${((minTime - 5) / 15) * 100}% - 7px)`,
                    }}
                    onMouseDown={() => setActiveThumb("left")}
                    onTouchStart={() => setActiveThumb("left")}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#3a4550] rounded-full border-2 border-white shadow-sm cursor-pointer z-10"
                    style={{
                      left: `calc(${((maxTime - 5) / 15) * 100}% - 7px)`,
                    }}
                    onMouseDown={() => setActiveThumb("right")}
                    onTouchStart={() => setActiveThumb("right")}
                  ></div>
                </div>
              </div>

              {/* Holes Toggle */}
              <div className="flex bg-[#f5f5f5] rounded-[3px] border border-gray-200 overflow-hidden text-xs font-bold shadow-sm">
                <button className="flex-1 py-2.5 bg-[#3a4550] text-white">
                  18 Holes
                </button>
                <button className="flex-1 py-2.5 text-gray-400 hover:bg-gray-50 transition-colors">
                  9 Holes
                </button>
              </div>

              {/* Choose Course */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">
                  Choose Course
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="course"
                      value="old-tom-morris"
                      checked={selectedCourse === "old-tom-morris"}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center p-[2px] ${selectedCourse === "old-tom-morris" ? "border-[#1a8bc4]" : "border-gray-300 group-hover:border-gray-400"}`}
                    >
                      {selectedCourse === "old-tom-morris" && (
                        <div className="w-full h-full bg-[#1a8bc4] rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-[13px] ${selectedCourse === "old-tom-morris" ? "text-gray-700 group-hover:text-black" : "text-gray-500 group-hover:text-gray-700"}`}
                    >
                      Old Tom Morris Links
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="course"
                      value="sandy-hills"
                      checked={selectedCourse === "sandy-hills"}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center p-[2px] ${selectedCourse === "sandy-hills" ? "border-[#1a8bc4]" : "border-gray-300 group-hover:border-gray-400"}`}
                    >
                      {selectedCourse === "sandy-hills" && (
                        <div className="w-full h-full bg-[#1a8bc4] rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-[13px] ${selectedCourse === "sandy-hills" ? "text-gray-700 group-hover:text-black" : "text-gray-500 group-hover:text-gray-700"}`}
                    >
                      Sandy Hills Links
                    </span>
                  </label>
                </div>
              </div>

              {/* Group By Toggle */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">
                  Group Tee Times By
                </div>
                <div className="flex bg-[#f5f5f5] rounded-[3px] border border-gray-200 overflow-hidden text-xs font-bold shadow-sm">
                  <button
                    onClick={() => setGroupBy("price")}
                    className={`flex-1 py-2.5 ${groupBy === "price" ? "bg-[#3a4550] text-white" : "text-gray-400 hover:bg-gray-50 transition-colors"}`}
                  >
                    Price
                  </button>
                  <button
                    onClick={() => setGroupBy("time")}
                    className={`flex-1 py-2.5 ${groupBy === "time" ? "bg-[#3a4550] text-white" : "text-gray-400 hover:bg-gray-50 transition-colors"}`}
                  >
                    Time
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">
                  Filter Options
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={viewPackages}
                    onChange={(e) => setViewPackages(e.target.checked)}
                    className="w-4 h-4 text-[#1a8bc4] border-gray-300 rounded focus:ring-[#1a8bc4]"
                  />
                  <span className="text-[13px] text-gray-700 group-hover:text-black">
                    View Packages
                  </span>
                </label>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full py-3 bg-[#1a8bc4] hover:bg-[#1572a1] disabled:bg-[#86b5cb] transition-colors text-white font-bold text-xs tracking-wider uppercase rounded-[3px] shadow-sm flex justify-center items-center gap-2"
              >
                {isRefreshing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Refresh Tee Times"
                )}
              </button>
            </div>
          </div>

          {/* Sunrise/Sunset Box */}
          <div className="bg-gradient-to-r from-[#fbd14b] to-[#f39c12] rounded-[3px] p-5 flex justify-between items-center text-white shadow-sm">
            <div className="text-center">
              <div className="font-semibold text-sm">Sunrise</div>
              <div className="font-bold text-lg">04:50</div>
            </div>
            <Sun className="w-10 h-10 text-white" strokeWidth={1.5} />
            <div className="text-center">
              <div className="font-semibold text-sm">Sunset</div>
              <div className="font-bold text-lg">22:13</div>
            </div>
          </div>
        </div>

        {/* Middle Column - Tee Times */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Alert Message */}
          {selectedCourse === "old-tom-morris" && showTodaysMessage && (
            <div className="bg-[#f2f8fb] border border-[#a2d0e7] p-5 relative text-sm rounded-[3px]">
              <button
                onClick={() => setShowTodaysMessage(false)}
                className="absolute top-3 right-3 text-[#1a8bc4] hover:text-[#1572a1] transition-colors"
              >
                <X className="w-5 h-5 bg-[#1a8bc4] text-white rounded-full p-1" />
              </button>
              <div className="font-bold text-[#1a8bc4] mb-2 text-[13px]">
                Today's Message
              </div>
              <div className="text-gray-600 leading-relaxed text-[13px]">
                <span className="font-bold text-gray-700">
                  06:00 - Irish Resident Rate
                </span>{" "}
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
                  <div className="w-8 h-8 border-4 border-[#1a8bc4] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Section 1 */}
                  <div className="shadow-sm">
                    <div className="bg-[#56606a] text-white px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                      <span>
                        1. Standard Visitor -{" "}
                        {selectedCourse === "old-tom-morris"
                          ? "Old Tom Morris"
                          : "Sandy Hills Links"}
                      </span>
                      <span>From €200.00</span>
                    </div>
                    <div className="bg-white border-x border-b border-gray-200 p-5 rounded-b-[3px]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                        {standardTimes.map((time) => (
                          <div key={`std-${time}`} className="relative group">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === `std-${time}`
                                    ? null
                                    : `std-${time}`,
                                )
                              }
                              className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors shadow-sm ${activeDropdown === `std-${time}` ? "bg-[#006e9e] text-white" : "bg-[#1a8bc4] hover:bg-[#1572a1] text-white"}`}
                            >
                              {time}
                            </button>

                            {/* Click Dropdown */}
                            {activeDropdown === `std-${time}` && (
                              <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[3px] p-1 flex flex-col gap-1">
                                <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=1&price=200")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  1 PLAYER - €200.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=2&price=400")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  2 PLAYER - €400.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=3&price=600")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  3 PLAYER - €600.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=4&price=800")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  4 PLAYER - €800.00
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="shadow-sm">
                    <div className="bg-[#56606a] text-white px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
                      <span>
                        2. Irish Resident -{" "}
                        {selectedCourse === "old-tom-morris"
                          ? "Old Tom Morris"
                          : "Sandy Hills Links"}
                      </span>
                      <span>From €90.00</span>
                    </div>
                    <div className="bg-white border-x border-b border-gray-200 p-5 rounded-b-[3px]">
                      <p className="text-gray-500 text-[13px] mb-5 leading-relaxed">
                        Irish driving licence or N Ireland driving licence as
                        well as a Golf Ireland / iGolf Index required to qualify
                        for this rate. Both will be subject to verification on
                        arrival, see terms &amp; conditions below for further
                        detail.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                        {irishTimes.map((time) => (
                          <div key={`irish-${time}`} className="relative group">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === `irish-${time}`
                                    ? null
                                    : `irish-${time}`,
                                )
                              }
                              className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors shadow-sm ${activeDropdown === `std-${time}` ? "bg-[#006e9e] text-white" : "bg-[#1a8bc4] hover:bg-[#1572a1] text-white"}`}
                            >
                              {time}
                            </button>

                            {/* Click Dropdown */}
                            {activeDropdown === `irish-${time}` && (
                              <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[3px] p-1 flex flex-col gap-1">
                                <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=1&price=90")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  1 PLAYER - €90.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=2&price=180")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  2 PLAYER - €180.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=3&price=270")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  3 PLAYER - €270.00
                                </button>
                                <button
                                  onClick={() =>
                                    router.push("/booking?players=4&price=360")
                                  }
                                  className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full"
                                >
                                  4 PLAYER - €360.00
                                </button>
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

        {/* Right Column - Info */}
        <Sidebar />
      </div>
    </div>
  );
}
