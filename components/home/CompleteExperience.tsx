import Image from "next/image";

export default function CompleteExperience() {
  return (
    <section className="relative h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/experience.png"
        alt="Complete Experience"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="text-center max-w-5xl">
          {/* Small Heading */}
          <p className="uppercase tracking-[0.45em] text-[#C9A24A] text-[11px] md:text-xs">
            Beyond The Links
          </p>

          {/* Gold Line */}
          <div className="w-16 h-px bg-[#C9A24A] mx-auto mt-4 mb-8"></div>

          {/* Main Heading */}
          <h2 className="font-serif text-white text-3xl md:text-5xl font-semibold leading-tight">
            The Complete Experience
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-[#DDD] text-lg md:text-xl leading-8 max-w-3xl mx-auto">
            Dining, leisure, and adventure await beyond the fairways
          </p>
        </div>
      </div>
    </section>
  );
}
