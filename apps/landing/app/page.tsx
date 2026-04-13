import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LiveTonight from '@/components/LiveTonight';
import FomoHook from '@/components/FomoHook';
import Features from '@/components/Features';
import BlinkFeedSection from '@/components/BlinkFeedSection';
import DjDiscovery from '@/components/DjDiscovery';
import CrowdMeterDemo from '@/components/CrowdMeterDemo';
import Passport from '@/components/Passport';
import Voices from '@/components/Voices';
import Faq from '@/components/Faq';
import Waitlist from '@/components/Waitlist';
import PartnerCTA from '@/components/PartnerCTA';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient page-level orbs */}
      <div className="orb top-[-10%] left-[-15%] w-[620px] h-[620px] bg-[#C45AFF]/[0.18]" />
      <div className="orb top-[40%] right-[-20%] w-[720px] h-[720px] bg-[#6A2BBE]/[0.15]" />
      <div className="orb bottom-[-10%] left-[10%] w-[520px] h-[520px] bg-[#C45AFF]/[0.12]" />

      <Navbar />
      <Hero />
      <LiveTonight />
      <FomoHook />
      <Features />
      <BlinkFeedSection />
      <DjDiscovery />
      <CrowdMeterDemo />
      <Passport />
      <Voices />
      <Faq />
      <Waitlist />
      <PartnerCTA />
      <Footer />
    </main>
  );
}
