import Link from "next/link";
import Image from "next/image";

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="bg-[#050505] py-24 px-6 border-t border-[#DBB155]/10"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Left — Text */}
        <div>
          <p className="text-[#DBB155] tracking-[0.3em] uppercase text-[11px] font-semibold mb-3">
            The Rosapenna Experience
          </p>
          <div className="w-10 h-px bg-[#DBB155] mb-6" />
          <h2 className="font-serif text-white text-4xl md:text-5xl leading-tight mb-6">
            Golf, Stay &amp;{" "}
            <span className="text-[#DBB155] italic">Dine in Style</span>
          </h2>
          <p className="text-gray-400 leading-relaxed mb-5">
            Rosapenna Hotel &amp; Golf Resort offers the complete links golf
            holiday experience. Stay in our luxury hotel overlooking Sheephaven
            Bay, dine on fresh Atlantic seafood, and play three of Ireland's
            finest championship links courses.
          </p>
          <p className="text-gray-400 leading-relaxed mb-10">
            Whether you're a seasoned links golfer or discovering Irish golf for
            the first time, Rosapenna provides an unforgettable escape on the
            wild Atlantic Way.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tee-times"
              className="px-7 py-3.5 bg-[#DBB155] text-black font-bold tracking-[0.15em] text-[11px] uppercase hover:bg-[#c9a04a] transition-colors"
            >
              Book Golf
            </Link>
            <Link
              href="#packages"
              id="packages"
              className="px-7 py-3.5 border border-[#DBB155]/50 text-[#DBB155] font-bold tracking-[0.15em] text-[11px] uppercase hover:border-[#DBB155] transition-colors"
            >
              Stay &amp; Play Packages
            </Link>
          </div>
        </div>

        {/* Right — Image grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-64 overflow-hidden">
            <Image
              src="/images/oldTom.jpg"
              alt="Old Tom Morris Links"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="relative h-64 overflow-hidden mt-8">
            <Image
              src="/images/sandhill-bg.jpg"
              alt="Sandy Hills Links"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
