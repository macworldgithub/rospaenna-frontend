import Link from "next/link";
import Image from "next/image";

const courses = [
  {
    title: "St Patrick's Links",
    subtitle: "Designed by Tom Doak",
    holes: 18,
    par: 73,
    desc: "A modern masterpiece carved through towering sand dunes with breathtaking ocean views from every hole.",
    img: "/images/home1.png",
  },
  {
    title: "Sandy Hills Links",
    subtitle: "Designed by Pat Ruddy",
    holes: 18,
    par: 71,
    desc: "A dramatic links experience winding through spectacular natural dune formations.",
    img: "/images/home2.png",
  },
  {
    title: "Old Tom Morris Links",
    subtitle: "Designed by Old Tom Morris / Harry Vardon",
    holes: 18,
    par: 70,
    desc: "The original course that started it all, laid out by Old Tom Morris himself in 1893.",
    img: "/images/home3.png",
  },
];

export default function CourseShowcase() {
  return (
    <section className="bg-black text-white py-10 px-4 sm:px-6">
      <div className="max-w-350 mx-auto grid grid-cols-1 gap-12">
        {courses.map((c, i) => (
          <div
            key={c.title}
            className={`grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6 lg:gap-0 ${
              i % 2 === 1 ? "lg:grid-flow-col-dense lg:grid-cols-2" : ""
            }`}
          >
            {/* Image */}
            <div
              className={`w-full h-105 relative ${i % 2 === 1 ? "lg:order-2" : ""}`}
            >
              <Image
                src={c.img}
                alt={c.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Text */}
            <div
              className={`flex flex-col justify-center px-0 sm:px-6 lg:px-12 ${i % 2 === 1 ? "lg:order-1" : ""}`}
            >
              <p className="text-[#DBB155] tracking-[0.3em] uppercase text-[11px] font-semibold mb-3">
                Established 1893
              </p>
              <h3 className="font-serif text-white text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                {c.title}
              </h3>
              <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">
                {c.desc}
              </p>

              <div className="flex items-center gap-8 mb-6">
                <div>
                  <div className="text-[#DBB155] font-bold">{c.holes}</div>
                  <div className="text-gray-400 text-sm">Holes</div>
                </div>
                <div>
                  <div className="text-[#DBB155] font-bold">{c.par}</div>
                  <div className="text-gray-400 text-sm">Par</div>
                </div>
              </div>

              <Link
                href="/book-golf"
                className="text-[#DBB155] font-semibold tracking-[0.15em] uppercase"
              >
                Book this course —
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
