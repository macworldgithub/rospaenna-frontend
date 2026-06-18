import Link from 'next/link';
import Image from 'next/image';

function LandingNavbar() {
  return (
    <nav className="w-full py-6 px-6 md:px-12 flex items-center justify-between">
      <div className="flex-1"></div>
      <div className="flex-1 flex justify-center items-center">
        <div className="flex items-center text-[#5a9aa8]">
          <span className="text-sm font-bold mt-4 tracking-wider">18</span>
          <span className="font-serif text-6xl mx-1 italic leading-none" style={{ fontFamily: 'Georgia, serif' }}>R</span>
          <span className="text-sm font-bold mt-4 tracking-wider">93</span>
        </div>
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="#" className="text-white bg-[#316070] px-4 py-4 text-[20px] font-medium tracking-wide">
          Book Golf
        </Link>
      </div>
    </nav>
  );
}

export default function BookGolfMainPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f3] flex flex-col">
      <LandingNavbar />
      <div className="max-w-[1200px] w-full mx-auto px-6 py-6 flex-grow">
        {/* Container to match screenshot style */}
        <div className="border-b border-gray-300 pb-6 mb-8">
          <h1 className="text-5xl md:text-[42px] font-serif mb-4 text-[#111]">Tee Times at Rosapenna</h1>

          <p className="md:text-[20px] text-[14px] leading-relaxed max-w-[1000px] font-sans text-black">
            Click below to book your tee times. Please note that if you're booking Stay & Play, golf will be booked at a discounted rate by the resort as part of that package - <Link href="#" className="text-[#1a8bc4] hover:underline">Book Golf and Resort</Link>. Looking to book for 2027 ? Combine Golf and Resort to <Link href="#" className="text-[#1a8bc4] hover:underline">Book for 2027</Link>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Card 1: Old Tom Morris */}
          <Link href="/tee-times" className="group relative block aspect-[1/2.2] w-full overflow-hidden bg-black transition-transform duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: 'url("/images/oldTom.jpg")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end h-[50%]">
              <div className="relative w-full h-full max-h-[140px] shrink-0">
                <Image src="/images/OTM.png" alt="Old Tom Morris Links" fill className="object-contain object-bottom drop-shadow-md" />
              </div>
            </div>
          </Link>

          {/* Card 2: Sandy Hills */}
          <Link href="/tee-times" className="group relative block aspect-[1/2.2] w-full overflow-hidden bg-black transition-transform duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: 'url("/images/sandhill-bg.jpg")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end h-[50%]">
              <div className="relative w-full h-full max-h-[140px] shrink-0">
                <Image src="/images/sandyhills.png" alt="Sandy Hills Links" fill className="object-contain object-bottom drop-shadow-md" />
              </div>
            </div>
          </Link>

          {/* Card 3: St. Patrick's Links */}
          <Link href="/tee-times" className="group relative block aspect-[1/2.2] w-full overflow-hidden bg-black transition-transform duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: 'url("/images/ST-patricks.jpg")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end h-[50%]">
              <div className="relative w-full h-full max-h-[140px] shrink-0">
                <Image src="/images/stpatricks.png" alt="St. Patrick's Links" fill className="object-contain object-bottom drop-shadow-md" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
