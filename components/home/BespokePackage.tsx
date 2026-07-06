"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  BedDouble,
  Flag,
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";

const steps = [
  {
    title: "Dates",
    icon: Calendar,
  },
  {
    title: "Guests",
    icon: Users,
  },
  {
    title: "Rooms",
    icon: BedDouble,
  },
  {
    title: "Golf",
    icon: Flag,
  },
  {
    title: "Review",
    icon: Check,
  },
];

export default function BespokePackage() {
  const [currentStep, setCurrentStep] = useState(0);

  const [arrivalDate, setArrivalDate] = useState("");
  const [nights, setNights] = useState(2);

  const [groupSize, setGroupSize] = useState(2);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [roomType, setRoomType] = useState("TWIN / DOUBLE");
  const [roomStandard, setRoomStandard] = useState("CLASSIC");

  const [stPatricksRounds, setStPatricksRounds] = useState(1);
  const [sandyHillsRounds, setSandyHillsRounds] = useState(1);
  const [oldTomMorrisRounds, setOldTomMorrisRounds] = useState(1);
  const [playOnArrival, setPlayOnArrival] = useState(false);
  const [playOnDeparture, setPlayOnDeparture] = useState(false);

  const [additionalRequests, setAdditionalRequests] = useState("");

  const totalRounds = stPatricksRounds + sandyHillsRounds + oldTomMorrisRounds;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <section
      id="packages"
      className="bg-[#050505] py-10 px-4 sm:px-5 scroll-mt-24"
    >
      <div className="max-w-230 mx-auto">
        {/* Heading */}

        <p className="uppercase tracking-[0.45em] text-[11px] text-[#D4AF55]">
          AI-Powered Concierge
        </p>

        <div className="w-16 h-px bg-[#D4AF55] mt-5 mb-10"></div>

        <h2 className="font-serif font-semibold text-white text-2xl sm:text-4xl leading-tight">
          Build Your <span className="text-[#D4AF55]">Bespoke Package</span>
        </h2>

        <p className="text-[#A8A8A8] text-md md:text-lg leading-8 mt-6 max-w-3xl">
          Our intelligent booking assistant will guide you through creating the
          perfect stay and golf experience.
        </p>

        {/* Stepper */}

        <div className="mt-10 overflow-x-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center min-w-0">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center border transition-colors shrink-0
                      ${
                        index === currentStep
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : index < currentStep
                            ? "border-[#D4AF55] text-[#D4AF55]"
                            : "border-[#323232] text-[#7d7d7d]"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>

                    <span
                      className={`ml-3 uppercase tracking-[0.3em] text-[11px] transition-colors
                      ${index <= currentStep ? "text-[#D4AF55]" : "text-[#757575]"}`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index !== steps.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-6 transition-colors ${
                        index < currentStep ? "bg-[#D4AF55]" : "bg-[#222]"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}

        <div className="mt-8 border border-[#181818] bg-[#070707] p-6 sm:p-10">
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Notice */}
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
                <Sparkles size={18} className="text-[#D4AF55] mt-1 shrink-0" />
                <p className="text-[#E2BE69] leading-7">
                  For the best links golf experience, we recommend visiting
                  between May and September when Donegal's weather is at its
                  finest. Midweek stays often offer the best availability on our
                  championship courses.
                </p>
              </div>

              {/* Arrival */}
              <div className="mt-6">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Arrival Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-[#0B0B0B] border border-[#181818] h-16 px-5 text-white outline-none focus:border-[#D4AF55] scheme-dark"
                  />
                </div>
              </div>

              {/* Nights */}
              <div className="mt-6">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Number of Nights
                </label>
                <div className="flex flex-wrap gap-3">
                  {[2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNights(num)}
                      className={`w-12 h-12 border transition-colors flex items-center justify-center
                      ${
                        nights === num
                          ? "bg-[#D4AF55] border-[#D4AF55] text-black font-semibold"
                          : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
                <Sparkles size={18} className="text-[#D4AF55] mt-1 shrink-0" />
                <p className="text-[#E2BE69] leading-8">
                  Groups of 4 are ideal for golf — you'll have a perfect
                  fourball for each round. We can arrange custom tee times to
                  keep your group together across all three courses.
                </p>
              </div>

              <div className="mt-8">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Group Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 6, 8, 12, 16, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGroupSize(num)}
                      className={`w-12 h-12 border transition-colors flex items-center justify-center
                      ${
                        groupSize === num
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                      }`}
                    >
                      <span className="text-sm">{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0B0B0B] border border-[#181818] h-14 px-5 text-white outline-none focus:border-[#D4AF55] placeholder-[#333] transition-colors"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0B0B0B] border border-[#181818] h-14 px-5 text-white outline-none focus:border-[#D4AF55] placeholder-[#333] transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 w-full md:w-[calc(50%-12px)]">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+353..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#181818] h-14 px-5 text-white outline-none focus:border-[#D4AF55] placeholder-[#333] transition-colors"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
                <Sparkles size={18} className="text-[#D4AF55] mt-1 shrink-0" />
                <p className="text-[#E2BE69] leading-8">
                  Our Bay View Junior Suites offer stunning views of the
                  Atlantic and are the most popular choice among golfers. After
                  a day on the links, nothing compares to watching the sunset
                  over Sheephaven Bay from your private balcony.
                </p>
              </div>

              <div className="mt-8">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Room Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["SINGLE", "TWIN / DOUBLE", "COMBINATION"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setRoomType(type)}
                      className={`h-14 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors border
                      ${
                        roomType === type
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Room Standard
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {["CLASSIC", "DELUXE", "BAYVIEW", "PENTHOUSE"].map(
                    (standard) => (
                      <button
                        key={standard}
                        onClick={() => setRoomStandard(standard)}
                        className={`h-14 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors border
                      ${
                        roomStandard === standard
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                      }`}
                      >
                        {standard}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
                <Sparkles size={18} className="text-[#D4AF55] mt-1 shrink-0" />
                <p className="text-[#E2BE69] leading-8">
                  Excellent choice! Playing all three courses is the ultimate
                  Rosapenna experience. Our Three Links Ticket offers the best
                  value at just €250 per person — a significant saving over
                  individual green fees.
                </p>
              </div>

              <div className="mt-8">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Rounds Per Course
                </label>

                <div className="flex flex-col gap-4">
                  <div className="border border-[#181818] p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-md font-serif">
                        St Patrick's Links
                      </h4>
                      <span className="uppercase tracking-[0.2em] text-[9px] text-[#D4AF55] mt-1 block">
                        World Top 50
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setStPatricksRounds(Math.max(0, stPatricksRounds - 1))
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        -
                      </button>
                      <span className="text-[#D4AF55] w-4 text-center">
                        {stPatricksRounds}
                      </span>
                      <button
                        onClick={() =>
                          setStPatricksRounds(stPatricksRounds + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#181818] p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-md font-serif">
                        Sandy Hills Links
                      </h4>
                      <span className="uppercase tracking-[0.2em] text-[9px] text-[#D4AF55] mt-1 block">
                        Ireland's Top 50
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setSandyHillsRounds(Math.max(0, sandyHillsRounds - 1))
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        -
                      </button>
                      <span className="text-[#D4AF55] w-4 text-center">
                        {sandyHillsRounds}
                      </span>
                      <button
                        onClick={() =>
                          setSandyHillsRounds(sandyHillsRounds + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#181818] p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-md font-serif">
                        Old Tom Morris Links
                      </h4>
                      <span className="uppercase tracking-[0.2em] text-[9px] text-[#757575] mt-1 block">
                        Est. 1893
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setOldTomMorrisRounds(
                            Math.max(0, oldTomMorrisRounds - 1),
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        -
                      </button>
                      <span className="text-[#D4AF55] w-4 text-center">
                        {oldTomMorrisRounds}
                      </span>
                      <button
                        onClick={() =>
                          setOldTomMorrisRounds(oldTomMorrisRounds + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => setPlayOnArrival(!playOnArrival)}
                  className={`h-14 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors border
                  ${
                    playOnArrival
                      ? "border-[#D4AF55] text-[#D4AF55]"
                      : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                  }`}
                >
                  Play on Arrival Day
                </button>
                <button
                  onClick={() => setPlayOnDeparture(!playOnDeparture)}
                  className={`h-14 flex items-center justify-center uppercase tracking-[0.2em] text-[11px] transition-colors border
                  ${
                    playOnDeparture
                      ? "border-[#D4AF55] text-[#D4AF55]"
                      : "border-[#181818] text-[#A8A8A8] hover:border-[#333]"
                  }`}
                >
                  Play on Departure Day
                </button>
              </div>

              <div className="mt-6 border border-[#5d4a20] bg-[#19140C] h-16 flex items-center justify-center">
                <span className="text-[#D4AF55] font-serif text-2xl mr-2">
                  {totalRounds}
                </span>
                <span className="uppercase tracking-[0.2em] text-[11px] text-[#A88945]">
                  Total Rounds
                </span>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-4 items-start">
                <Sparkles size={18} className="text-[#D4AF55] mt-1 shrink-0" />
                <p className="text-[#E2BE69] leading-8">
                  Your package is looking wonderful. Our concierge team will
                  personally review your request and respond within 24 hours
                  with a tailored quote. We look forward to welcoming you to
                  Rosapenna.
                </p>
              </div>

              <div className="mt-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Arrival
                    </span>
                    <span className="text-white">
                      {arrivalDate || "Not Selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Nights
                    </span>
                    <span className="text-white">{nights}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Group Size
                    </span>
                    <span className="text-white">{groupSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Room
                    </span>
                    <span className="text-white capitalize">
                      {roomStandard.toLowerCase()}{" "}
                      {roomType === "TWIN / DOUBLE"
                        ? "Twin"
                        : roomType.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      St Patrick's
                    </span>
                    <span className="text-white">
                      {stPatricksRounds} Round(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Sandy Hills
                    </span>
                    <span className="text-white">
                      {sandyHillsRounds} Round(s)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Old Tom Morris
                    </span>
                    <span className="text-white">
                      {oldTomMorrisRounds} Round(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.3em] text-[11px] text-[#757575]">
                      Total Rounds
                    </span>
                    <span className="text-white">{totalRounds}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <label className="block uppercase tracking-[0.3em] text-[11px] text-[#A88945] mb-4">
                  Additional Requests
                </label>
                <textarea
                  rows={4}
                  placeholder="Any special requirements or preferences..."
                  value={additionalRequests}
                  onChange={(e) => setAdditionalRequests(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#181818] p-5 text-white outline-none focus:border-[#D4AF55] placeholder-[#333] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer */}

          <div className="border-t border-[#171717] mt-10 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`uppercase tracking-[0.3em] text-[11px] flex items-center gap-2 transition-colors
              ${currentStep === 0 ? "text-[#333] cursor-not-allowed" : "text-[#666] hover:text-white"}`}
            >
              <ArrowLeft size={15} />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="bg-[#D4AF55] hover:bg-[#c7a042] transition-all px-10 h-12 min-w-42.5 uppercase tracking-[0.35em] text-[11px] font-semibold text-black flex items-center justify-center gap-3"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => alert("Request submitted!")}
                className="bg-[#D4AF55] hover:bg-[#c7a042] transition-all px-10 h-12 min-w-42.5 uppercase tracking-[0.35em] text-[11px] font-semibold text-black flex items-center justify-center gap-3"
              >
                <Send size={15} className="mr-1" />
                Submit Request
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
