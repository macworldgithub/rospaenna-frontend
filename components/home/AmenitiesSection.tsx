import { UtensilsCrossed, Waves, Mountain, Car } from "lucide-react";

const amenities = [
  {
    title: "Fine Dining",
    description:
      "Savour locally sourced Donegal cuisine in our award-winning restaurant, with panoramic views of the Atlantic and championship links.",
    icon: UtensilsCrossed,
  },
  {
    title: "Leisure Centre",
    description:
      "Unwind in our heated swimming pool, steam room, and fully equipped gym. The perfect way to recover after a day on the links.",
    icon: Waves,
  },
  {
    title: "Outdoor Activities",
    description:
      "Explore Donegal's wild beauty with guided walks, beach excursions, and water sports along the stunning Sheephaven Bay coastline.",
    icon: Mountain,
  },
  {
    title: "EV Charging & GoCar",
    description:
      "Sustainable travel options including on-site EV charging stations and GoCar hire for exploring the surrounding Donegal countryside.",
    icon: Car,
  },
];

export default function AmenitiesSection() {
  return (
    <section
      id="experience"
      className="bg-[#050505] py-16 sm:py-24 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {amenities.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="bg-[#070707] border border-[#141414] hover:border-[#C9A24A] transition-all duration-300 p-6 sm:p-9 group"
              >
                {/* Icon */}
                <div className="w-8 h-8 border border-[#C9A24A] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#C9A24A]" />
                </div>

                {/* Title */}
                <h3 className="text-white text-[20px] font-serif font-semibold leading-tight mb-4">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[#9A9A9A] text-sm leading-6">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
