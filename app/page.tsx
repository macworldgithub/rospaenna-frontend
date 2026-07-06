import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import GolfSection from "@/components/home/GolfSection";
import CourseShowcase from "@/components/home/CourseShowcase";
import HomeFooter from "@/components/home/HomeFooter";
import ThreeLinksTicket from "@/components/home/ThreeLinksTicket";
import GolfHeritage from "@/components/home/GolfHeritage";
import LuxuryAccommodation from "@/components/home/LuxuryAccommodation";
import AccommodationCards from "@/components/home/AccommodationCards";
import BespokePackage from "@/components/home/BespokePackage";
import CompleteExperience from "@/components/home/CompleteExperience";
import AmenitiesSection from "@/components/home/AmenitiesSection";
import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <HeroSection />
      <GolfSection />
      <CourseShowcase />
      <ThreeLinksTicket />
      <GolfHeritage />
      <LuxuryAccommodation />
      <AccommodationCards />
      <BespokePackage />
      <CompleteExperience />
      <AmenitiesSection />
      <HomeFooter />
      <ChatWidget />
    </div>
  );
}
