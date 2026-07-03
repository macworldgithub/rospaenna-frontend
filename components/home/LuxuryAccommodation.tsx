import Image from "next/image";

export default function LuxuryAccommodation() {
  return (
    <section className="relative h-[420px] md:h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/Luxury.png" // Replace with your image
        alt="Luxury Accommodation"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          {/* Small Heading */}
          <div className="flex flex-col items-center mb-6">
            <p className="uppercase tracking-[0.45em] text-[#C8A14A] text-[11px]">
              Your Retreat Awaits
            </p>

            <div className="w-14 h-px bg-[#C8A14A] mt-4"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-white font-serif font-semibold text-2xl md:text-4xl lg:text-6xl leading-tight">
            Luxury Accommodation
          </h1>
        </div>
      </div>
    </section>
  );
}
