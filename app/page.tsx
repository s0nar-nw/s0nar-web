"use client";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaSection } from "@/components/home/cta-section";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.86)_34%,rgba(0,0,0,0.96)),url('/bg-hero.png')] bg-[length:100%_auto] bg-top bg-no-repeat pb-20 pt-24">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
  );
}
