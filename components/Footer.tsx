import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-[#DBB155]/20 text-white pt-12 pb-6 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px] leading-relaxed">
          {/* Column 1 */}
          <div className="font-semibold text-gray-300">
            <ul className="space-y-0.5">
              <li className="text-[#DBB155]">Rosapenna Golf Resort</li>
              <li>Sheephaven Bay</li>
              <li>Downings</li>
              <li>Letterkenny</li>
              <li>Donegal</li>
              <li>F92 PN73</li>
              <li>Ireland</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-start gap-2 font-semibold text-gray-300">
            <a href="tel:+353749155000" className="underline">+353 (0)74 915 5000</a>
            <a href="mailto:golf@rosapenna.ie" className="underline">golf@rosapenna.ie</a>
          </div>

          <nav aria-label="Footer" className="flex flex-col items-start gap-2">
            <Link href="/" className="underline">Resort Home</Link>
            <Link href="/book-golf" className="underline">Book Golf</Link>
            <a href="https://rosapenna.ie/privacy-statement-eu/" className="underline">Privacy Policy</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
