export default function Navbar() {
  return (
    <nav className="w-full bg-black border-b border-[#DBB155]/20">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-white flex flex-col justify-center">
          <div className="text-sm font-bold tracking-widest uppercase text-[#DBB155]">
            Old Tom Morris Links / Sandy Hills Links
          </div>
          <div className="text-sm font-bold tracking-widest uppercase mt-0.5 text-gray-300">
            Visitors Booking
          </div>
        </div>
        {/* <div>
          <button className="px-6 py-2 border border-[#DBB155] text-[#DBB155] font-bold tracking-wider text-sm hover:bg-[#DBB155]/10 transition-colors uppercase">
            Login
          </button>
        </div> */}
      </div>
    </nav>
  );
}
