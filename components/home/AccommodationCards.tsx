import { Crown, Eye, Star, BedDouble } from "lucide-react";

const rooms = [
  {
    title: "Penthouse Suite",
    description:
      "The pinnacle of luxury at Rosapenna. Panoramic views of the Atlantic and championship links from your private terrace.",
    icon: Crown,
    tags: ["Panoramic Ocean Views", "Private Terrace", "Premium Amenities"],
  },
  {
    title: "Bay View Junior Suite",
    description:
      "Spacious suites with stunning bay views, perfect for golfers seeking comfort after a day on the links.",
    icon: Eye,
    tags: ["Bay Views", "Separate Living Area", "King Bed"],
  },
  {
    title: "Deluxe Room",
    description:
      "Elegantly appointed rooms with all the comforts you need for a memorable golf retreat.",
    icon: Star,
    tags: ["Garden or Sea Views", "Luxury Linens", "Complimentary WiFi"],
  },
  {
    title: "Classic Room",
    description:
      "Comfortable and refined, our classic rooms offer the perfect base for your Rosapenna experience.",
    icon: BedDouble,
    tags: ["Ensuite Bathroom", "Flat Screen TV", "Tea & Coffee"],
  },
];

export default function AccommodationCards() {
  return (
    <section className="bg-[#050505] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room, index) => {
            const Icon = room.icon;

            return (
              <div
                key={index}
                className="bg-[#070707] border border-[#111] hover:border-[#9f7a32] transition-all duration-300 p-8"
              >
                {/* Icon */}
                <div className="w-8 h-8 border border-[#9f7a32] flex items-center justify-center mb-8">
                  <Icon size={20} className="text-[#d4af55]" />
                </div>

                {/* Title */}
                <h3 className="text-white text-3xl font-serif font-semibold mb-4">
                  {room.title}
                </h3>

                {/* Description */}
                <p className="text-[#9b9b9b] text-md leading-8 mb-8">
                  {room.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#242424] text-[#B48B3A] uppercase tracking-[0.22em] text-[8px] px-4 py-3"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
