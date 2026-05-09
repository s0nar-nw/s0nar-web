"use client";

import { motion } from "motion/react";
import { ActionLink } from "@/components/sonar-ui";
import { Cobe } from "@/components/ui/cobe-globe";

const STATS = [
  { value: "0-100", label: "Health score" },
  { value: "Regions", label: "Local network view" },
  { value: "Clients", label: "Client diversity" },
  { value: "On-chain", label: "Readable program state" },
];

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-screen min-h-[calc(100vh-4rem)] w-full items-start justify-start overflow-hidden px-6 pb-[18rem] pt-16 [--hero-gutter:1.5rem] supports-[height:100svh]:min-h-[calc(100svh-4rem)] sm:px-10 sm:[--hero-gutter:3rem] md:min-h-screen md:items-center md:pb-28 md:pt-10 lg:min-h-[calc(100vh-6rem)] lg:pb-36 lg:pt-6 lg:[--hero-gutter:clamp(5rem,8vw,12rem)]">
      {/* Hero copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex max-w-[42rem] flex-col items-start text-left md:absolute md:left-[var(--hero-gutter)] md:top-1/2 md:-translate-y-1/2"
      >
        {/* Eyebrow badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5 inline-flex items-center gap-2 rounded-[12px] border border-[#2de19b]/24 bg-[rgba(4,16,12,0.86)] px-3 py-2"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2de19b]" />
          <span className="text-xs font-medium tracking-wide text-[#2de19b]">
            Devnet
          </span>
        </motion.div> */}

        {/* Headline */}
        <h1 className="max-w-[11ch] bg-[linear-gradient(180deg,#ffffff_0%,#dfffee_44%,#2de19b_100%)] bg-clip-text text-[3.15rem] font-semibold leading-[0.95] tracking-[-0.045em] text-transparent sm:text-7xl sm:tracking-[-0.055em]">
          Network <span>Health</span>, on-chain
          <span className="text-primary">.</span>
        </h1>

        {/* Body copy — tightened and punchy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mt-5 max-w-[36ch] text-[0.82rem] font-medium leading-[1.65] text-neutral-400 sm:max-w-[38ch] sm:text-sm"
        >
          s0nar shows whether Solana is reachable, slow, or healthy across
          regions. Check the live score, observer activity, validator client
          diversity, and the on-chain state behind it.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4"
        >
          <ActionLink href="/network" primary>
            Open dashboard
          </ActionLink>
          <ActionLink href="/docs">
            SDK docs
          </ActionLink>
        </motion.div>

        {/* Stats row — fills the empty bottom-left */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="mt-10 grid grid-cols-2 gap-x-7 gap-y-4 border-t border-white/8 pt-6 sm:mt-14 sm:flex sm:items-start sm:gap-x-8 sm:gap-y-5 sm:pt-8"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[1.15rem] font-semibold leading-none tracking-tight text-white sm:text-2xl">
                {stat.value}
              </span>
              <span className="text-[0.68rem] font-medium leading-[1.35] text-neutral-500 sm:text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Globe — untouched */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 54 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1.35, ease: "easeOut" }}
        className="
          absolute right-[-45vw] bottom-[-34vw] z-[1]
          h-[118vw] w-[118vw]
          rounded-full
          drop-shadow-[0_0_3.8rem_rgba(45,225,155,0.42)]
          sm:right-[-50vw] sm:bottom-[-72vw] sm:h-[128vw] sm:w-[128vw]
          lg:right-[-36vw] lg:bottom-[-52vw] lg:h-[92vw] lg:w-[92vw]
          xl:right-[-26rem] xl:bottom-[-40rem] xl:h-[76rem] xl:w-[76rem]
          2xl:right-[-22rem]
        "
      >
        <Cobe
          variant="auto-draggable"
          phi={4.8}
          theta={0.24}
          dark={0.96}
          diffuse={3}
          mapSamples={17000}
          mapBrightness={7.4}
          mapBaseBrightness={0.006}
          baseColor="#38ffb0"
          markerColor="#2de19b"
          markerSize={0.018}
          glowColor="#2de19b"
          opacity={0.96}
          style={{
            maxWidth: "none",
            aspectRatio: "1 / 1",
            filter:
              "brightness(1.08) saturate(1.42) contrast(1.2) drop-shadow(0 0 22px rgba(45,225,155,0.38))",
          }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[24rem] bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.32)_18%,rgba(0,0,0,0.78)_48%,#000_78%,#000_100%)] sm:h-40 sm:bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.52)_72%,#000)]"
      />
    </section>
  );
}
