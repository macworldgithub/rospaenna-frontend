"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Phone, Mail, MapPin, X, Sun, Info } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-16");
  const [mounted, setMounted] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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
    
    const suffix = (day === 1 || day === 21 || day === 31) ? "st" :
                   (day === 2 || day === 22) ? "nd" :
                   (day === 3 || day === 23) ? "rd" : "th";
                   
    return `${dayName} ${day}${suffix} ${monthName}`;
  };

  const standardTimes = ["07:30", "08:00", "08:10", "09:40", "09:50", "11:10", "11:50", "12:00", "14:30", "14:40", "14:50", "15:00", "15:10", "15:20"];
  const irishTimes = ["07:30", "08:00", "08:10", "09:40", "09:50", "11:10", "11:50", "12:00", "14:30", "14:40", "14:50", "15:00", "15:10", "15:20"];

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
                  <span>05:00 - 20:00</span>
                </div>
                <div className="relative h-1 bg-gray-300 rounded-full mt-3">
                  <div className="absolute left-0 right-0 h-full bg-[#3a4550] rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#3a4550] rounded-full border-2 border-white shadow-sm cursor-pointer"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#3a4550] rounded-full border-2 border-white shadow-sm cursor-pointer"></div>
                </div>
              </div>

              {/* Holes Toggle */}
              <div className="flex bg-[#f5f5f5] rounded-[3px] border border-gray-200 overflow-hidden text-xs font-bold shadow-sm">
                <button className="flex-1 py-2.5 bg-[#3a4550] text-white">18 Holes</button>
                <button className="flex-1 py-2.5 text-gray-400 hover:bg-gray-50 transition-colors">9 Holes</button>
              </div>

              {/* Choose Course */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">Choose Course</div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-full border border-[#1a8bc4] flex items-center justify-center p-[2px]">
                      <div className="w-full h-full bg-[#1a8bc4] rounded-full"></div>
                    </div>
                    <span className="text-[13px] text-gray-700 group-hover:text-black">Old Tom Morris Links</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center p-[2px] group-hover:border-gray-400"></div>
                    <span className="text-[13px] text-gray-500 group-hover:text-gray-700">Sandy Hills Links</span>
                  </label>
                </div>
              </div>

              {/* Group By Toggle */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">Group Tee Times By</div>
                <div className="flex bg-[#f5f5f5] rounded-[3px] border border-gray-200 overflow-hidden text-xs font-bold shadow-sm">
                  <button className="flex-1 py-2.5 bg-[#3a4550] text-white">Price</button>
                  <button className="flex-1 py-2.5 text-gray-400 hover:bg-gray-50 transition-colors">Time</button>
                </div>
              </div>

              {/* Filter Options */}
              <div>
                <div className="text-[12px] text-gray-500 mb-3">Filter Options</div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#1a8bc4] border-gray-300 rounded focus:ring-[#1a8bc4]" />
                  <span className="text-[13px] text-gray-700 group-hover:text-black">View Packages</span>
                </label>
              </div>

              {/* Refresh Button */}
              <button className="w-full py-3 bg-[#1a8bc4] hover:bg-[#1572a1] transition-colors text-white font-bold text-xs tracking-wider uppercase rounded-[3px] shadow-sm">
                Refresh Tee Times
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
          <div className="bg-[#f2f8fb] border border-[#a2d0e7] p-5 relative text-sm rounded-[3px]">
            <button className="absolute top-3 right-3 text-[#1a8bc4] hover:text-[#1572a1] transition-colors">
              <X className="w-5 h-5 bg-[#1a8bc4] text-white rounded-full p-1" />
            </button>
            <div className="font-bold text-[#1a8bc4] mb-2 text-[13px]">Today's Message</div>
            <div className="text-gray-600 leading-relaxed text-[13px]">
              <span className="font-bold text-gray-700">06:00 - Irish Resident Rate</span> - please note this rate is for selected off peak tee times. Additional peak tee times (Standard Visitor times) will become bookable within 28 days of your selected date of play, if they remain available.
            </div>
          </div>

          {/* Section 1 */}
          <div className="shadow-sm">
            <div className="bg-[#56606a] text-white px-5 py-3 flex justify-between items-center font-bold tracking-wide uppercase text-[12px] rounded-t-[3px]">
              <span>1. Standard Visitor - Old Tom Morris</span>
              <span>From €200.00</span>
            </div>
            <div className="bg-white border-x border-b border-gray-200 p-5 rounded-b-[3px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                {standardTimes.map(time => (
                  <div key={`std-${time}`} className="relative group">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === `std-${time}` ? null : `std-${time}`)}
                      className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors shadow-sm ${activeDropdown === `std-${time}` ? 'bg-[#006e9e] text-white' : 'bg-[#1a8bc4] hover:bg-[#1572a1] text-white'}`}
                    >
                      {time}
                    </button>

                    {/* Click Dropdown */}
                    {activeDropdown === `std-${time}` && (
                      <div
                        className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[3px] p-1 flex flex-col gap-1"
                      >
                        <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                        <button onClick={() => router.push('/booking?players=1&price=200')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">1 PLAYER - €200.00</button>
                        <button onClick={() => router.push('/booking?players=2&price=400')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">2 PLAYER - €400.00</button>
                        <button onClick={() => router.push('/booking?players=3&price=600')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">3 PLAYER - €600.00</button>
                        <button onClick={() => router.push('/booking?players=4&price=800')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">4 PLAYER - €800.00</button>
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
              <span>2. Irish Resident - Old Tom Morris</span>
              <span>From €90.00</span>
            </div>
            <div className="bg-white border-x border-b border-gray-200 p-5 rounded-b-[3px]">
              <p className="text-gray-500 text-[13px] mb-5 leading-relaxed">
                Irish driving licence or N Ireland driving licence as well as a Golf Ireland / iGolf Index required to qualify for this rate. Both will be subject to verification on arrival, see terms &amp; conditions below for further detail.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 relative">
                {irishTimes.map(time => (
                  <div key={`irish-${time}`} className="relative group">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === `irish-${time}` ? null : `irish-${time}`)}
                      className={`w-full py-2.5 font-bold text-[13px] rounded-[3px] transition-colors shadow-sm ${activeDropdown === `std-${time}` ? 'bg-[#006e9e] text-white' : 'bg-[#1a8bc4] hover:bg-[#1572a1] text-white'}`}                    >
                      {time}
                    </button>

                    {/* Click Dropdown */}
                    {activeDropdown === `irish-${time}` && (
                      <div
                        className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 z-50 w-[170px] bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[3px] p-1 flex flex-col gap-1"
                      >
                        <div className="absolute -top-[5px] left-8 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                        <button onClick={() => router.push('/booking?players=1&price=90')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">1 PLAYER - €90.00</button>
                        <button onClick={() => router.push('/booking?players=2&price=180')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">2 PLAYER - €180.00</button>
                        <button onClick={() => router.push('/booking?players=3&price=270')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">3 PLAYER - €270.00</button>
                        <button onClick={() => router.push('/booking?players=4&price=360')} className="bg-[#0072a3] text-white py-1.5 px-3 text-[12px] font-bold text-left rounded-[2px] hover:bg-[#005f8a] transition-colors relative z-20 w-full">4 PLAYER - €360.00</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <Sidebar />

      </div>
    </div>
  );
}
