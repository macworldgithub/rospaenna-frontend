"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { X } from "lucide-react";

const inputClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] placeholder-gray-600 text-sm";
const selectClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] text-sm appearance-none cursor-pointer";
const labelClass = "text-xs font-semibold text-gray-400";
const requiredClass = "text-[#DBB155]";

function BookingForm() {
  const searchParams = useSearchParams();
  const playersStr = searchParams.get("players");
  const priceStr = searchParams.get("price");

  const players = playersStr ? parseInt(playersStr, 10) : 2;
  const price = priceStr ? `€${priceStr}.00` : "€180.00";
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowModal(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const termsCheckbox = (
    <div className={`mt-8 ${players === 1 ? 'mb-4' : ''}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 mt-0.5 border-gray-600 rounded accent-[#DBB155]" />
        <span className="text-[11px] text-gray-400 font-bold leading-tight">
          I have read and I accept the <a href="#" className="text-[#DBB155] hover:underline">Privacy Policy</a> and Visitor <a href="#" className="text-[#DBB155] hover:underline">Terms and Conditions</a>
        </span>
      </label>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col gap-10">

      {/* Timer Alert */}
      <div className="text-center text-[#d9534f] font-medium text-sm">
        You have {minutes} minute{minutes !== 1 ? 's' : ''} and {seconds} second{seconds !== 1 ? 's' : ''} to complete your booking
      </div>

      {/* Booking Expired Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="bg-[#0a0a0a] border border-[#DBB155]/20 rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 text-center relative">
            {/* Close X icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-[3px] border-[#d9534f] flex items-center justify-center">
                <X className="w-10 h-10 text-[#d9534f]" strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Booking Expired</h2>

            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              The time available to confirm this booking has now expired. When you click OK, you will be returned the Booking Details screen and if the slot you wish to book is still available, the timer will restart and you will be able to attempt to complete your booking again.
            </p>

            <p className="text-[#d9534f] text-sm leading-relaxed mb-6">
              If the time slot is no longer available, you will be informed and returned to the book tee times screen to select another time.
            </p>

            <button
              onClick={() => router.push('/')}
              className="bg-[#DBB155] hover:bg-[#c9a04a] transition-colors text-black font-bold text-sm px-10 py-2.5 rounded-[3px]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

          {/* Your Details (Player 1) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Your Details</h3>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>First Name<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Last Name<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Country<span className={requiredClass}>*</span></label>
              <select className={selectClass}>
                <option value="">Select one</option>
                <option value="Argentina">Argentina</option>
                <option value="Austria">Austria</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Barbados">Barbados</option>
                <option value="Belgium">Belgium</option>
                <option value="Canada">Canada</option>
                <option value="China">China</option>
                <option value="Denmark">Denmark</option>
                <option value="England">England</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email<span className={requiredClass}>*</span></label>
              <input type="email" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Telephone<span className={requiredClass}>*</span></label>
              <input type="tel" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Mobile</label>
              <input type="tel" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CDH Number</label>
              <input type="text" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className={labelClass}>Please provide details of any special requirements</label>
              <textarea rows={4} className={`${inputClass} resize-none`}></textarea>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-gray-400">
                I agree to receive information, newsletters, promotions and offers from Rosapenna Golf Resort.
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
                  <span className="text-[11px] text-gray-400 font-bold">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
                  <span className="text-[11px] text-gray-400 font-bold">SMS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
                  <span className="text-[11px] text-gray-400 font-bold">Post</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
                  <span className="text-[11px] text-gray-400 font-bold">Telephone</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column in Form (Other Players & Terms) */}
          <div className="flex flex-col gap-10">
            {players >= 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Two Details</h3>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>CDH Number</label>
                  <input type="text" className={inputClass} />
                </div>
              </div>
            )}

            {players >= 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Three Details</h3>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>CDH Number</label>
                  <input type="text" className={inputClass} />
                </div>
              </div>
            )}

            {players >= 4 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Four Details</h3>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
                  <input type="text" className={inputClass} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelClass}>CDH Number</label>
                  <input type="text" className={inputClass} />
                </div>
              </div>
            )}

            {players > 1 && termsCheckbox}
          </div>

        </div>
      </div>

      <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

      {/* Booking Details */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Booking Details</h2>

        <div className="flex flex-col text-[13px]">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Type</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">Golf Package</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Total Booking Fee</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{price}</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Date/Time</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">07:30 Tuesday 16th June 2026</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Course</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">Old Tom Morris Links</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Holes</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">18</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Number of Players</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{players}</div>
          </div>
        </div>
      </div>

      {players === 1 && termsCheckbox}

      <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

      {/* Payment */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Payment</h2>

        <div className="max-w-[400px]">
          <div className="relative border border-[#DBB155]/20 rounded-[3px] flex items-center p-3 bg-[#111111]">
            <div className="flex items-center gap-3 flex-1">
              {/* Card Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" />
                <rect x="2" y="9" width="20" height="3" fill="#000000" fillOpacity="0.4" />
              </svg>
              <input type="text" placeholder="Card number" className="w-full outline-none text-sm placeholder-gray-600 bg-transparent text-white" />
            </div>
            <button className="bg-[#DBB155] hover:bg-[#c9a04a] text-black text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
              Autofill
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-start items-center gap-4 mt-6 mb-12">
          <button
            onClick={() => router.push('/tee-times')}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white transition-colors font-bold text-xs tracking-widest uppercase rounded-[3px]"
          >
            Cancel
          </button>
          <button className="w-full sm:w-auto px-8 sm:px-24 py-3 bg-[#DBB155] hover:bg-[#c9a04a] transition-colors text-black font-bold text-xs tracking-widest uppercase rounded-[3px]">
            Pay
          </button>
        </div>
      </div>

    </div>
  );
}

export default function Booking() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        <Suspense fallback={<div className="flex-1 flex justify-center py-20 text-gray-400">Loading...</div>}>
          <BookingForm />
        </Suspense>

        {/* Right Column - Info */}
        <Sidebar />

      </div>
    </div>
  );
}
