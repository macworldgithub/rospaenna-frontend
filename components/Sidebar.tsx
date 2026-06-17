"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [mapUrl, setMapUrl] = useState("https://maps.google.com/maps?q=Rosapenna%20Hotel%20%26%20Golf%20Resort&t=&z=13&ie=UTF8&iwloc=&output=embed");
  const [directionsUrl, setDirectionsUrl] = useState("https://www.google.com/maps/dir//Rosapenna+Hotel+%26+Golf+Resort/");

  useEffect(() => {
    // Fetch location based on IP
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.latitude && data.longitude) {
          const lat = data.latitude;
          const lon = data.longitude;
          setMapUrl(`https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
          setDirectionsUrl(`https://www.google.com/maps/dir/${lat},${lon}/Rosapenna+Hotel+%26+Golf+Resort/`);
        }
      })
      .catch((err) => console.log("Using default location, IP fetch failed/blocked."));
  }, []);

  return (
    <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-6">
      <div className="bg-white border border-gray-200 p-8 flex flex-col items-center rounded-[3px] shadow-sm">
        {/* Illustration Placeholder */}
        <div className="w-48 h-48 mb-4 flex items-center justify-center">
          <img src="/images/oldMan.png" alt="Old Man Illustration" className="w-full h-full object-contain" />
        </div>

        <a href="https://www.rosapenna.ie" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-[13px] hover:text-[#1a8bc4] transition-colors mb-6 font-medium tracking-wide">
          www.rosapenna.ie
        </a>

        <div className="w-full flex flex-col gap-2.5 mb-8">
          <a href="tel:+353749155301" className="w-full bg-[#1a8bc4] hover:bg-[#1572a1] transition-colors text-white py-2.5 flex items-center justify-center gap-2 font-bold text-[13px] tracking-wider uppercase rounded-[3px] shadow-sm">
            <Phone className="w-4 h-4" />
            Call Us
          </a>
          <a href="mailto:golf@rosapenna.ie" className="w-full bg-[#1a8bc4] hover:bg-[#1572a1] transition-colors text-white py-2.5 flex items-center justify-center gap-2 font-bold text-[13px] tracking-wider uppercase rounded-[3px] shadow-sm">
            <Mail className="w-4 h-4" />
            Email Us
          </a>
        </div>

        <p className="text-[11px] text-gray-500 leading-[1.8] text-justify mb-8">
          Located on the edge of the picturesque Sheephaven Bay, Rosapenna is the proud home to the Old Tom Morris Links designed by Old Tom Morris of St. Andrews in 1893 and a modern great in the Sandy Hills Links laid out by Pat Ruddy of The European Club fame and open for play since 2003. Our new St Patrick's Links by Tom Doak is available to book online via the link on our homepage. This spectacular links opened in late June 2021 and has taken the golf world by storm, rising 5 places in the GOLF Magazine Top 100 in the World rankings 2025-26 to a new high of #44. With a luxury hotel on site, Rosapenna is the perfect venue for a golf break or just a quiet getaway in this beautiful corner of Donegal.
        </p>

        {/* Embedded Google Map */}
        <div className="w-full h-48 mb-4 relative rounded-[3px] overflow-hidden border border-gray-200 shadow-sm group">
          <iframe
            title="User Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
          ></iframe>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label="Open directions in Google Maps"
          ></a>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#1a8bc4] hover:bg-[#1572a1] transition-colors text-white py-2.5 flex items-center justify-center gap-2 font-bold text-[13px] tracking-wider uppercase rounded-[3px] shadow-sm"
        >
          <MapPin className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  );
}
