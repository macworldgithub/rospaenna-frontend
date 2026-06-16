export default function Footer() {
  return (
    <footer className="w-full bg-[#3a4550] text-white pt-12 pb-6 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 text-[13px] leading-relaxed">
          {/* Column 1 */}
          <div className="font-semibold">
            <ul className="space-y-0.5">
              <li>Old Tom Morris Links / Sandy Hills Links</li>
              <li>Rosapenna Golf Resort</li>
              <li>Sheephaven Bay</li>
              <li>Downings</li>
              <li>Letterkenny</li>
              <li>Donegal</li>
              <li>F92 PN73</li>
              <li>Ireland</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="font-semibold">
            <div>T: +353 (0)74 915 5000</div>
            <div>E: brs@rosapenna.ie</div>
            <div className="mt-4 uppercase">Privacy Policy</div>
            <div className="uppercase">Terms &amp; Conditions</div>
          </div>

          {/* Column 3 */}
          <div>
            <div className="font-semibold mb-2">All major credit cards accepted</div>
            <div className="flex gap-2 items-center">
              {/* Stripe */}
              <div className="font-bold text-white text-xl tracking-tighter">stripe</div>
              {/* Mastercard */}
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#EB001B" />
                <circle cx="22" cy="10" r="10" fill="#F79E1B" />
              </svg>
              {/* Visa */}
              <div className="bg-white px-1.5 py-0.5 rounded-sm">
                <div className="text-[#1A1F71] font-bold text-xs italic tracking-tighter">VISA</div>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="flex md:justify-end items-start">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-black tracking-tighter">BRS</span>
              <span className="bg-white text-black px-2 py-0.5 rounded-md text-2xl font-bold tracking-tight">Core</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] font-bold uppercase tracking-wider">
          © 2026 - BRS BY GOLFNOW. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
