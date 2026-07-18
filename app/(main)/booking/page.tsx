// "use client";

// import { Suspense, useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import { X } from "lucide-react";

// const inputClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] placeholder-gray-600 text-sm";
// const selectClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] text-sm appearance-none cursor-pointer";
// const labelClass = "text-xs font-semibold text-gray-400";
// const requiredClass = "text-[#DBB155]";

// function BookingForm() {
//   const searchParams = useSearchParams();
//   const playersStr = searchParams.get("players");
//   const priceStr = searchParams.get("price");

//   const players = playersStr ? parseInt(playersStr, 10) : 2;
//   const price = priceStr ? `€${priceStr}.00` : "€180.00";
//   const router = useRouter();

//   const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     if (timeLeft <= 0) {
//       setShowModal(true);
//       return;
//     }
//     const interval = setInterval(() => {
//       setTimeLeft((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [timeLeft]);

//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;

//   const termsCheckbox = (
//     <div className={`mt-8 ${players === 1 ? 'mb-4' : ''}`}>
//       <label className="flex items-start gap-3 cursor-pointer">
//         <input type="checkbox" className="w-4 h-4 mt-0.5 border-gray-600 rounded accent-[#DBB155]" />
//         <span className="text-[11px] text-gray-400 font-bold leading-tight">
//           I have read and I accept the <a href="#" className="text-[#DBB155] hover:underline">Privacy Policy</a> and Visitor <a href="#" className="text-[#DBB155] hover:underline">Terms and Conditions</a>
//         </span>
//       </label>
//     </div>
//   );

//   return (
//     <div className="flex-1 flex flex-col gap-10">

//       {/* Timer Alert */}
//       <div className="text-center text-[#d9534f] font-medium text-sm">
//         You have {minutes} minute{minutes !== 1 ? 's' : ''} and {seconds} second{seconds !== 1 ? 's' : ''} to complete your booking
//       </div>

//       {/* Booking Expired Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
//           <div className="bg-[#0a0a0a] border border-[#DBB155]/20 rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 text-center relative">
//             {/* Close X icon */}
//             <div className="flex justify-center mb-4">
//               <div className="w-16 h-16 rounded-full border-[3px] border-[#d9534f] flex items-center justify-center">
//                 <X className="w-10 h-10 text-[#d9534f]" strokeWidth={2.5} />
//               </div>
//             </div>

//             <h2 className="text-2xl font-bold text-white mb-4">Booking Expired</h2>

//             <p className="text-gray-400 text-sm leading-relaxed mb-3">
//               The time available to confirm this booking has now expired. When you click OK, you will be returned the Booking Details screen and if the slot you wish to book is still available, the timer will restart and you will be able to attempt to complete your booking again.
//             </p>

//             <p className="text-[#d9534f] text-sm leading-relaxed mb-6">
//               If the time slot is no longer available, you will be informed and returned to the book tee times screen to select another time.
//             </p>

//             <button
//               onClick={() => router.push('/')}
//               className="bg-[#DBB155] hover:bg-[#c9a04a] transition-colors text-black font-bold text-sm px-10 py-2.5 rounded-[3px]"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="flex flex-col gap-8">
//         <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Personal Information</h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

//           {/* Your Details (Player 1) */}
//           <div className="flex flex-col gap-4">
//             <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Your Details</h3>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>First Name<span className={requiredClass}>*</span></label>
//               <input type="text" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Last Name<span className={requiredClass}>*</span></label>
//               <input type="text" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Country<span className={requiredClass}>*</span></label>
//               <select className={selectClass}>
//                 <option value="">Select one</option>
//                 <option value="Argentina">Argentina</option>
//                 <option value="Austria">Austria</option>
//                 <option value="Bahrain">Bahrain</option>
//                 <option value="Barbados">Barbados</option>
//                 <option value="Belgium">Belgium</option>
//                 <option value="Canada">Canada</option>
//                 <option value="China">China</option>
//                 <option value="Denmark">Denmark</option>
//                 <option value="England">England</option>
//                 <option value="Finland">Finland</option>
//                 <option value="France">France</option>
//                 <option value="Germany">Germany</option>
//                 <option value="Iceland">Iceland</option>
//                 <option value="India">India</option>
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Email<span className={requiredClass}>*</span></label>
//               <input type="email" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Telephone<span className={requiredClass}>*</span></label>
//               <input type="tel" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Mobile</label>
//               <input type="tel" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
//               <input type="text" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
//               <input type="text" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className={labelClass}>CDH Number</label>
//               <input type="text" className={inputClass} />
//             </div>

//             <div className="flex flex-col gap-1 mt-2">
//               <label className={labelClass}>Please provide details of any special requirements</label>
//               <textarea rows={4} className={`${inputClass} resize-none`}></textarea>
//             </div>

//             <div className="mt-4 flex flex-col gap-3">
//               <p className="text-[11px] font-bold text-gray-400">
//                 I agree to receive information, newsletters, promotions and offers from Rosapenna Golf Resort.
//               </p>
//               <div className="flex flex-wrap gap-4">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
//                   <span className="text-[11px] text-gray-400 font-bold">Email</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
//                   <span className="text-[11px] text-gray-400 font-bold">SMS</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
//                   <span className="text-[11px] text-gray-400 font-bold">Post</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]" />
//                   <span className="text-[11px] text-gray-400 font-bold">Telephone</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Right Column in Form (Other Players & Terms) */}
//           <div className="flex flex-col gap-10">
//             {players >= 2 && (
//               <div className="flex flex-col gap-4">
//                 <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Two Details</h3>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>CDH Number</label>
//                   <input type="text" className={inputClass} />
//                 </div>
//               </div>
//             )}

//             {players >= 3 && (
//               <div className="flex flex-col gap-4">
//                 <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Three Details</h3>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>CDH Number</label>
//                   <input type="text" className={inputClass} />
//                 </div>
//               </div>
//             )}

//             {players >= 4 && (
//               <div className="flex flex-col gap-4">
//                 <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Player Four Details</h3>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
//                   <input type="text" className={inputClass} />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className={labelClass}>CDH Number</label>
//                   <input type="text" className={inputClass} />
//                 </div>
//               </div>
//             )}

//             {players > 1 && termsCheckbox}
//           </div>

//         </div>
//       </div>

//       <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

//       {/* Booking Details */}
//       <div className="flex flex-col gap-6">
//         <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Booking Details</h2>

//         <div className="flex flex-col text-[13px]">
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Type</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">Golf Package</div>
//           </div>
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Total Booking Fee</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{price}</div>
//           </div>
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Date/Time</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">07:30 Tuesday 16th June 2026</div>
//           </div>
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Course</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">Old Tom Morris Links</div>
//           </div>
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Holes</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">18</div>
//           </div>
//           <div className="flex flex-col sm:flex-row">
//             <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Number of Players</div>
//             <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{players}</div>
//           </div>
//         </div>
//       </div>

//       {players === 1 && termsCheckbox}

//       <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

//       {/* Payment */}
//       <div className="flex flex-col gap-6">
//         <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Payment</h2>

//         <div className="max-w-[400px]">
//           <div className="relative border border-[#DBB155]/20 rounded-[3px] flex items-center p-3 bg-[#111111]">
//             <div className="flex items-center gap-3 flex-1">
//               {/* Card Icon */}
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
//                 <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" />
//                 <rect x="2" y="9" width="20" height="3" fill="#000000" fillOpacity="0.4" />
//               </svg>
//               <input type="text" placeholder="Card number" className="w-full outline-none text-sm placeholder-gray-600 bg-transparent text-white" />
//             </div>
//             <button className="bg-[#DBB155] hover:bg-[#c9a04a] text-black text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
//               Autofill
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M5 12h14M12 5l7 7-7 7" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col-reverse sm:flex-row justify-start items-center gap-4 mt-6 mb-12">
//           <button
//             onClick={() => router.push('/tee-times')}
//             className="w-full sm:w-auto px-8 sm:px-12 py-3 border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white transition-colors font-bold text-xs tracking-widest uppercase rounded-[3px]"
//           >
//             Cancel
//           </button>
//           <button className="w-full sm:w-auto px-8 sm:px-24 py-3 bg-[#DBB155] hover:bg-[#c9a04a] transition-colors text-black font-bold text-xs tracking-widest uppercase rounded-[3px]">
//             Pay
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default function Booking() {
//   return (
//     <div className="max-w-[1400px] mx-auto px-6 py-8">
//       <div className="flex flex-col lg:flex-row gap-6">

//         <Suspense fallback={<div className="flex-1 flex justify-center py-20 text-gray-400">Loading...</div>}>
//           <BookingForm />
//         </Suspense>

//         {/* Right Column - Info */}
//         <Sidebar />

//       </div>
//     </div>
//   );
// }

"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { X } from "lucide-react";
import { PendingBooking } from "@/types/teesheet";

const inputClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] placeholder-gray-600 text-sm";
const selectClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] text-sm appearance-none cursor-pointer";
const labelClass = "text-xs font-semibold text-gray-400";
const requiredClass = "text-[#DBB155]";

interface PlayerForm {
  firstName: string;
  lastName: string;
  country: string;
  email: string;
  telephone: string;
  mobile: string;
  handicap: string;
  club: string;
  cdh: string;
}

const emptyPlayer = (): PlayerForm => ({
  firstName: "", lastName: "", country: "", email: "",
  telephone: "", mobile: "", handicap: "", club: "", cdh: "",
});

function BookingForm() {
  const searchParams = useSearchParams();
  const playersStr = searchParams.get("players");
  const priceStr = searchParams.get("price");

  const players = playersStr ? parseInt(playersStr, 10) : 2;
  const price = priceStr ? `€${priceStr}.00` : "€180.00";
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState<PendingBooking | null>(null);

  const [player1, setPlayer1] = useState<PlayerForm>(emptyPlayer());
  const [otherPlayers, setOtherPlayers] = useState<PlayerForm[]>(
    Array.from({ length: 3 }, emptyPlayer)
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketing, setMarketing] = useState({ email: false, sms: false, post: false, telephone: false });
  const [cardNumber, setCardNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingBooking");
    if (raw) {
      try {
        setBooking(JSON.parse(raw) as PendingBooking);
      } catch {
        setBooking(null);
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowModal(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const updateOtherPlayer = (idx: number, field: keyof PlayerForm, value: string) => {
    setOtherPlayers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handlePay = async () => {
    if (!booking) {
      setSubmitError("Booking session expired — please select a tee time again.");
      return;
    }
    if (players > 1 && !acceptedTerms) {
      setSubmitError("Please accept the terms and conditions.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const playersPayload: Record<string, unknown> = {
      "1": {
        first_name: player1.firstName,
        last_name: player1.lastName,
        type: "Visitor",
        club: player1.club,
        handicap: player1.handicap,
        cdh: player1.cdh || null,
        email: player1.email,
        telephone: player1.telephone,
        mobile: player1.mobile || player1.telephone,
        country: player1.country,
        address_line_1: null,
        address_line_2: null,
        city: null,
        county: null,
        postcode: null,
        notes: null,
        has_buggy: false,
      },
    };

    for (let i = 0; i < players - 1; i++) {
      const p = otherPlayers[i];
      playersPayload[String(i + 2)] = {
        first_name: p.firstName,
        last_name: p.lastName,
        type: "Visitor",
        club: p.club,
        handicap: p.handicap,
        cdh: p.cdh || null,
        email: null,
        telephone: null,
        mobile: null,
        country: null,
        address_line_1: null,
        address_line_2: null,
        city: null,
        county: null,
        postcode: null,
        notes: null,
        has_buggy: false,
      };
    }

    const payload = {
      marketing: { terms: acceptedTerms || players === 1, ...marketing },
      teeTime: {
        ...booking.teeTime,
        element_id: `package-${booking.greenFee.id}-${booking.date.replace(/-/g, "")}${booking.teeTime.time.replace(":", "")}`,
      },
      course: {
        id: booking.course.id,
        facilities_id: booking.course.facilities_id,
        name: booking.course.name,
        playing_time: booking.course.playing_time,
        colour: booking.course.colour,
      },
      players: playersPayload,
      date: booking.date,
      bookingType: "Package",
      price: booking.price,
      holes: booking.teeTime.holes || "18",
      greenFee: booking.greenFee,
      openCompetition: {},
      bookingCreatedResponse: null,
      packageDescription: booking.greenFee.package_description,
      setGoogleConversionTrackingResponse: null,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      sessionStorage.removeItem("pendingBooking");
      // TODO: route to a confirmation page once you know the checkout API's success shape
      alert("Booking submitted successfully!");
      router.push("/");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const termsCheckbox = (
    <div className={`mt-8 ${players === 1 ? 'mb-4' : ''}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 border-gray-600 rounded accent-[#DBB155]"
        />
        <span className="text-[11px] text-gray-400 font-bold leading-tight">
          I have read and I accept the <a href="#" className="text-[#DBB155] hover:underline">Privacy Policy</a> and Visitor <a href="#" className="text-[#DBB155] hover:underline">Terms and Conditions</a>
        </span>
      </label>
    </div>
  );

  const bookingDate = booking?.date
    ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-IE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className="flex-1 flex flex-col gap-10">

      <div className="text-center text-[#d9534f] font-medium text-sm">
        You have {minutes} minute{minutes !== 1 ? 's' : ''} and {seconds} second{seconds !== 1 ? 's' : ''} to complete your booking
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="bg-[#0a0a0a] border border-[#DBB155]/20 rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 text-center relative">
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

          <div className="flex flex-col gap-4">
            <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Your Details</h3>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>First Name<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} value={player1.firstName}
                onChange={(e) => setPlayer1({ ...player1, firstName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Last Name<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} value={player1.lastName}
                onChange={(e) => setPlayer1({ ...player1, lastName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Country<span className={requiredClass}>*</span></label>
              <select className={selectClass} value={player1.country}
                onChange={(e) => setPlayer1({ ...player1, country: e.target.value })}>
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
              <input type="email" className={inputClass} value={player1.email}
                onChange={(e) => setPlayer1({ ...player1, email: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Telephone<span className={requiredClass}>*</span></label>
              <input type="tel" className={inputClass} value={player1.telephone}
                onChange={(e) => setPlayer1({ ...player1, telephone: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Mobile</label>
              <input type="tel" className={inputClass} value={player1.mobile}
                onChange={(e) => setPlayer1({ ...player1, mobile: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} value={player1.handicap}
                onChange={(e) => setPlayer1({ ...player1, handicap: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
              <input type="text" className={inputClass} value={player1.club}
                onChange={(e) => setPlayer1({ ...player1, club: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CDH Number</label>
              <input type="text" className={inputClass} value={player1.cdh}
                onChange={(e) => setPlayer1({ ...player1, cdh: e.target.value })} />
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
                {(["email", "sms", "post", "telephone"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketing[key]}
                      onChange={(e) => setMarketing({ ...marketing, [key]: e.target.checked })}
                      className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]"
                    />
                    <span className="text-[11px] text-gray-400 font-bold capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {[2, 3, 4].map((num) =>
              players >= num ? (
                <div key={num} className="flex flex-col gap-4">
                  <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">
                    Player {num === 2 ? "Two" : num === 3 ? "Three" : "Four"} Details
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
                    <input type="text" className={inputClass}
                      value={otherPlayers[num - 2].firstName}
                      onChange={(e) => updateOtherPlayer(num - 2, "firstName", e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
                    <input type="text" className={inputClass}
                      value={otherPlayers[num - 2].handicap}
                      onChange={(e) => updateOtherPlayer(num - 2, "handicap", e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
                    <input type="text" className={inputClass}
                      value={otherPlayers[num - 2].club}
                      onChange={(e) => updateOtherPlayer(num - 2, "club", e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>CDH Number</label>
                    <input type="text" className={inputClass}
                      value={otherPlayers[num - 2].cdh}
                      onChange={(e) => updateOtherPlayer(num - 2, "cdh", e.target.value)} />
                  </div>
                </div>
              ) : null
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
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">
              {booking ? `${booking.teeTime.time} ${bookingDate}` : "—"}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Course</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{booking?.course.name ?? "—"}</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Holes</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{booking?.teeTime.holes || "18"}</div>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" />
                <rect x="2" y="9" width="20" height="3" fill="#000000" fillOpacity="0.4" />
              </svg>
              <input
                type="text" placeholder="Card number"
                className="w-full outline-none text-sm placeholder-gray-600 bg-transparent text-white"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <button className="bg-[#DBB155] hover:bg-[#c9a04a] text-black text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
              Autofill
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {submitError && (
          <div className="text-[#d9534f] text-sm max-w-[400px]">{submitError}</div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-start items-center gap-4 mt-6 mb-12">
          <button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white transition-colors font-bold text-xs tracking-widest uppercase rounded-[3px]"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full sm:w-auto px-8 sm:px-24 py-3 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-[#DBB155]/40 transition-colors text-black font-bold text-xs tracking-widest uppercase rounded-[3px]"
          >
            {submitting ? "Processing..." : "Pay"}
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
        <Sidebar />
      </div>
    </div>
  );
}