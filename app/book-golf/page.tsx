import Link from "next/link";
import Image from "next/image";

const courses = [
  {
    id: "old-tom-morris",
    name: "Old Tom Morris Links",
    image: "/images/oldTom.jpg",
    logo: "/images/OTM.png",
    alt: "Old Tom Morris Links",
  },
  {
    id: "sandy-hills",
    name: "Sandy Hills Links",
    image: "/images/sandhill-bg.jpg",
    logo: "/images/sandyhills.png",
    alt: "Sandy Hills Links",
  },
  {
    id: "st-patricks",
    name: "St Patrick's Links",
    image: "/images/ST-patricks.jpg",
    logo: "/images/stpatricks.png",
    alt: "St. Patrick's Links",
  },
];

function BookGolfNavbar() {
  return (
    <nav className="w-full py-5 px-6 md:px-12 flex items-center justify-between border-b border-[#DBB155]/10">
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Center — 18R93 logo */}
      <div className="flex-1 flex justify-center items-center">
        <Link href="/" className="flex items-center text-[#DBB155]">
          <span className="text-sm font-bold mt-4 tracking-wider">18</span>
          <span
            className="font-serif text-6xl mx-1 italic leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            R
          </span>
          <span className="text-sm font-bold mt-4 tracking-wider">93</span>
        </Link>
      </div>

      {/* Right — Book Golf button (current page) */}
      <div className="flex-1 flex justify-end">
        <Link
          href="/book-golf"
          className="hidden md:inline-block text-black bg-[#DBB155] px-5 py-2.5 text-[13px] font-bold tracking-[0.15em] uppercase hover:bg-[#c9a04a] transition-colors"
        >
          Book Golf
        </Link>
      </div>
    </nav>
  );
}

export default function BookGolfPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <BookGolfNavbar />

      <div className="max-w-[1200px] w-full mx-auto px-6 py-10 flex-grow">

        {/* Header */}
        <div className="border-b border-gray-700 pb-8 mb-10">
          <h1 className="text-4xl md:text-[42px] font-serif mb-5 text-[#DBB155]">
            Tee Times at Rosapenna
          </h1>
          <p className="text-base md:text-[17px] leading-relaxed max-w-[900px] text-gray-300">
            Click below to book your tee times. Please note that if you're
            booking Stay &amp; Play, golf will be booked at a discounted rate
            by the resort as part of that package —{" "}
            <Link href="#" className="text-[#DBB155] hover:underline">
              Book Golf and Resort
            </Link>
            . Looking to book for 2027? Combine Golf and Resort to{" "}
            <Link href="#" className="text-[#DBB155] hover:underline">
              Book for 2027
            </Link>
            .
          </p>
        </div>

        {/* Course Cards — click navigates to /tee-times */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 lg:gap-14">
          {courses.map((course) => (
            <Link
              key={course.id}
              href="/tee-times"
              className="group relative block aspect-[1/2.2] w-full max-w-[220px] overflow-hidden bg-black transition-transform duration-300 hover:scale-[1.03]"
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
          ))}
        </div>
      </div>
    </div>
  );
}
