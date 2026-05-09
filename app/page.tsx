"use client";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaSection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden pb-8 pt-24">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
