"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ActionLink } from "@/components/sonar-ui";

const World = dynamic(
  () => import("@/components/ui/globe").then((module) => module.World),
  { ssr: false },
);

const GLOBE_PRIMARY = "#2de19b";
const REGION_POINTS = {
  Asia: { lat: 1.3521, lng: 103.8198 },
  US: { lat: 39.8283, lng: -98.5795 },
  EU: { lat: 50.1109, lng: 8.6821 },
  SouthAmerica: { lat: -23.5558, lng: -46.6396 },
  Africa: { lat: -1.2864, lng: 36.8172 },
  Oceania: { lat: -33.8688, lng: 151.2093 },
  Other: { lat: 0, lng: -30 },
} as const;

const GLOBE_CONFIG = {
  pointSize: 2,
  globeColor: "#04100c",
  showAtmosphere: true,
  atmosphereColor: GLOBE_PRIMARY,
  atmosphereAltitude: 0.16,
  emissive: "#020806",
  emissiveIntensity: 0.38,
  shininess: 0.8,
  polygonColor: "rgba(45,225,155,0.45)",
  ambientLight: "#f5fff9",
  directionalLeftLight: GLOBE_PRIMARY,
  directionalTopLight: "#ffffff",
  pointLight: GLOBE_PRIMARY,
  arcTime: 1200,
  arcLength: 0.92,
  arcDashGap: 4,
  rings: 2,
  maxRings: 4.5,
  ringRefreshMs: 1000,
  initialPosition: { lat: 20, lng: -40 },
  autoRotate: true,
  autoRotateSpeed: 0.7,
} as const;

const GLOBE_DATA = [
  { order: 1, startLat: REGION_POINTS.US.lat, startLng: REGION_POINTS.US.lng, endLat: REGION_POINTS.Asia.lat, endLng: REGION_POINTS.Asia.lng, arcAlt: 0.28, color: GLOBE_PRIMARY },
  { order: 2, startLat: REGION_POINTS.EU.lat, startLng: REGION_POINTS.EU.lng, endLat: REGION_POINTS.Asia.lat, endLng: REGION_POINTS.Asia.lng, arcAlt: 0.22, color: GLOBE_PRIMARY },
  { order: 3, startLat: REGION_POINTS.EU.lat, startLng: REGION_POINTS.EU.lng, endLat: REGION_POINTS.Oceania.lat, endLng: REGION_POINTS.Oceania.lng, arcAlt: 0.35, color: GLOBE_PRIMARY },
  { order: 4, startLat: REGION_POINTS.US.lat, startLng: REGION_POINTS.US.lng, endLat: REGION_POINTS.SouthAmerica.lat, endLng: REGION_POINTS.SouthAmerica.lng, arcAlt: 0.26, color: GLOBE_PRIMARY },
  { order: 5, startLat: REGION_POINTS.Africa.lat, startLng: REGION_POINTS.Africa.lng, endLat: REGION_POINTS.Other.lat, endLng: REGION_POINTS.Other.lng, arcAlt: 0.2, color: GLOBE_PRIMARY },
  { order: 6, startLat: REGION_POINTS.Asia.lat, startLng: REGION_POINTS.Asia.lng, endLat: REGION_POINTS.Africa.lat, endLng: REGION_POINTS.Africa.lng, arcAlt: 0.24, color: GLOBE_PRIMARY },
  { order: 7, startLat: REGION_POINTS.Oceania.lat, startLng: REGION_POINTS.Oceania.lng, endLat: REGION_POINTS.Other.lat, endLng: REGION_POINTS.Other.lng, arcAlt: 0.3, color: GLOBE_PRIMARY },
] as const;

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-295 px-4 lg:pt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative isolate grid gap-8 py-10 lg:min-h-150 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.88fr)] lg:items-center lg:py-0"
      >
        <div className="relative z-10 flex max-w-112 flex-col items-start gap-6">
          <h1 className="max-w-[10ch] text-4xl font-semibold uppercase leading-none text-white md:text-6xl xl:text-7xl">
            Network health, on-chain<span className="text-primary">.</span>
          </h1>

          <p className="max-w-[42ch] text-sm leading-7 text-white/68">
            Distributed observers publish a compact health surface for operators,
            dashboards, and Solana programs.
          </p>

          <div className="flex flex-wrap gap-4">
            <ActionLink href="/network" primary>
              Open dashboard
            </ActionLink>
          </div>
        </div>

        <div
          className="pointer-events-none relative h-[18rem] w-full overflow-visible sm:h-[24rem] lg:h-[33rem]"
          aria-hidden="true"
        >
          <div className="absolute right-[-24%] top-1/2 aspect-square w-[92%] -translate-y-1/2 opacity-90 drop-shadow-[0_0_4rem_rgba(45,225,155,0.14)]">
            <div className="absolute inset-[-10%]">
              <World globeConfig={GLOBE_CONFIG} data={[...GLOBE_DATA]} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
