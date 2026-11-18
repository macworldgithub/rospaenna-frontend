import Link from "next/link";
import Image from "next/image";
import BookingChoiceSection from "@/components/booking/BookingChoiceSection";
import Navbar from "@/components/Navbar";

const courses = [
  {
    id: "old-tom-morris",
    name: "Old Tom Morris Links",
    courseId: 1,
    image: "/images/oldTom.jpg",
    logo: "/images/OTM.png",
    alt: "Old Tom Morris Links",
    available: true,
  },
  {
    id: "sandy-hills",
    name: "Sandy Hills Links",
    courseId: 3,
    image: "/images/sandhill-bg.jpg",
    logo: "/images/sandyhills.png",
    alt: "Sandy Hills Links",
    available: true,
  },
  {
    id: "st-patricks",
    name: "St Patrick's Links",
    courseId: 4,
    image: "/images/ST-patricks.jpg",
    logo: "/images/stpatricks.png",
    alt: "St. Patrick's Links",
    available: true,
  },
];

export default function BookGolfPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <Navbar />

      <div className="max-w-[1200px] w-full mx-auto px-6 py-10 flex-grow">

        {/* Header */}
        <div className="border-b border-gray-700 pb-8 mb-8">
          <h1 className="text-4xl md:text-[42px] font-serif mb-5 text-[#DBB155]">
            Tee Times at Rosapenna
          </h1>
          <p className="text-base md:text-[17px] leading-relaxed max-w-[900px] text-gray-300">
            Click below to explore our links or reserve tee times. If you are
            booking a Stay &amp; Play golf break, your tee times are booked at an exclusive discounted rate
            as part of your resort package —{" "}
            <Link href="/#packages" className="text-[#DBB155] hover:underline font-semibold">
              Book Stay &amp; Play Package
            </Link>
            . Looking to book for 2027? Combine luxury accommodation and golf to{" "}
            <Link href="/#packages" className="text-[#DBB155] hover:underline font-semibold">
              Book for 2027
            </Link>
            .
          </p>
        </div>

        {/* Booking Choice Section (N01) */}
        <BookingChoiceSection />

        {/* Course Cards */}
        <div id="courses" className="mt-12">
          <h2 className="text-2xl font-serif text-white mb-6 text-center">
            Our Championship Links
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 lg:gap-14">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col items-center max-w-[260px] w-full">
                <Link
                  href={`/tee-times?course=${course.id}`}
                  className="group relative block aspect-[1/2.2] w-full overflow-hidden bg-black transition-transform duration-300 hover:scale-[1.03]"
                  aria-label={`View tee times for ${course.name}`}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ backgroundImage: `url("${course.image}")` }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Logo */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end h-[50%]">
                    <div className="relative w-full h-full max-h-[140px] shrink-0">
                      <Image
                        src={course.logo}
                        alt={course.alt}
                        fill
                        className="object-contain object-bottom drop-shadow-md"
                      />
                    </div>
                  </div>

                  {/* Hover glow border */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-[#DBB155]/40 transition-colors duration-300" />
                </Link>

                <Link
                  href={`/tee-times?course=${course.id}`}
                  className="mt-4 w-full text-center text-xs py-2 bg-[#DBB155]/15 text-[#DBB155] border border-[#DBB155]/30 hover:bg-[#DBB155] hover:text-black font-semibold uppercase tracking-wider rounded-sm transition-colors"
                >
                  View Tee Times
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            Have questions or planning a group golf tour? Contact our golf team at{" "}
            <a href="tel:+353749155000" className="text-[#DBB155] hover:underline font-semibold">
              +353 (0)74 91 55000
            </a>{" "}
            or email{" "}
            <a href="mailto:golf@rosapenna.ie" className="text-[#DBB155] hover:underline">
              golf@rosapenna.ie
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
