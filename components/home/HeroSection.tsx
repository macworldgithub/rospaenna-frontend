import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/ST-patricks.jpg"
          alt="Rosapenna Golf Resort — Donegal coastline"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-end flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 pb-20 pt-36">
        {/* Location tag */}
        <p className="text-[#DBB155] tracking-[0.3em] uppercase text-[11px] font-semibold mb-5">
          Donegal, Ireland — Established 1893
        </p>
        <div className="w-8 h-px bg-[#DBB155] mb-6" />

        {/* Headline */}
        <h1 className="font-serif text-white text-5xl md:text-7xl lg:text-[80px] leading-[1.05] mb-5 max-w-3xl">
          Three Championship
          <br />
          Links.
          <br />
          <span className="text-[#DBB155] italic">One Legendary Resort.</span>
        </h1>

        {/* Subtext */}
        <p className="text-white/70 text-base md:text-lg max-w-[480px] leading-relaxed mb-10">
          Where the wild Atlantic meets the ancient dunes of Donegal.
          Experience world-class links golf at St Patrick's, Sandy Hills, and
          Old Tom Morris — all from one extraordinary resort.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="#packages"
            className="px-7 py-4 border border-[#DBB155] text-[#DBB155] font-bold tracking-[0.18em] text-[11px] uppercase hover:bg-[#DBB155]/10 transition-all duration-300"
          >
            Build Your Package
          </Link>
          <Link
            href="#golf"
            className="px-7 py-4 border border-white/40 text-white font-bold tracking-[0.18em] text-[11px] uppercase hover:bg-white/10 transition-all duration-300"
          >
            Explore Our Links
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <p className="text-white/40 tracking-[0.35em] uppercase text-[9px] font-semibold">
          Discover
        </p>
        <div className="w-px h-10 bg-gradient-to-b from-[#DBB155]/60 to-transparent animate-pulse" />
        <svg
          className="w-3 h-3 text-[#DBB155]/50 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
