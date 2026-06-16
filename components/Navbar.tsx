export default function Navbar() {
  return (
    <nav className="w-full bg-[#3a4550] border-[#855e38]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-white flex flex-col justify-center">
          <div className="text-sm font-bold tracking-widest uppercase">
            Old Tom Morris Links / Sandy Hills Links
          </div>
          <div className="text-sm font-bold tracking-widest uppercase mt-0.5">
            Visitors Booking
          </div>
        </div>
        <div>
          <button className="px-6 py-2 border border-white text-white font-bold tracking-wider text-sm hover:bg-white/10 transition-colors uppercase">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
