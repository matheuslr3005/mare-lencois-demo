import { AvailabilityProvider } from "@/components/AvailabilityProvider";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Perks } from "@/components/Perks";
import { Fleet } from "@/components/Fleet";
import { BookingSection } from "@/components/booking/BookingSection";
import { Routes } from "@/components/Routes";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";

export default function Home() {
  return (
    <AvailabilityProvider>
      <Header />
      <main>
        <Hero />
        <Perks />
        <Fleet />
        <BookingSection />
        <Routes />
        <Faq />
      </main>
      <Footer />
      <WhatsAppFab />
    </AvailabilityProvider>
  );
}
