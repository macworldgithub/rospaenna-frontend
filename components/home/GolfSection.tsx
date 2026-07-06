import Link from "next/link";
import Image from "next/image";

export default function GolfSection() {
  return (
    <section id="golf" className="bg-black py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-350 mx-auto">
        {/* Section Header */}
        <div className="mb-10 sm:mb-16">
          <p className="text-[#DBB155] tracking-[0.3em] uppercase text-[11px] font-semibold mb-3">
            Three Championship Links
          </p>
          <div className="w-10 h-px bg-[#DBB155] mb-6" />
          <h2 className="font-serif text-white text-3xl sm:text-4xl md:text-5xl leading-tight max-w-2xl">
            The Finest Links Golf
            <br />
            <span className="text-[#DBB155] italic">in All of Ireland</span>
          </h2>
          <p className="text-gray-400 text-base mt-5 max-w-xl leading-relaxed">
            Three world-class links courses, each with its own character and
            challenge, all set against the dramatic backdrop of Donegal's
            Atlantic coastline.
          </p>
        </div>
      </div>
    </section>
  );
}
