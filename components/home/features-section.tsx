"use client";

import { SectionKicker } from "@/components/home/section-kicker";
import { motion } from "motion/react";
import type { PointerEvent } from "react";

const PAIN_POINTS = [
  {
    number: "01",
    title: "One RPC can mislead you",
    copy: "Your endpoint may respond while users elsewhere see slow reads, failed sends, or delayed slots.",
  },
  {
    number: "02",
    title: "Location matters",
    copy: "A global status light hides where the network is slow. s0nar keeps regional health visible.",
  },
  {
    number: "03",
    title: "Client diversity",
    copy: "s0nar tracks validator clients alongside reachability, so apps can read client-risk signals on-chain.",
  },
  {
    number: "04",
    title: "Checkable health data",
    copy: "The dashboard reads the same on-chain accounts that protocols can inspect directly.",
  },
] as const;

function setGlowAngle(event: PointerEvent<HTMLDivElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle =
    Math.atan2(event.clientY - centerY, event.clientX - centerX) *
    (180 / Math.PI);

  card.style.setProperty("--angle", `${angle < 0 ? angle + 360 : angle}deg`);
}

export function FeaturesSection() {
  return (
    <section className="mx-auto mt-28 max-w-295 px-4">
      <div className="max-w-205">
        <SectionKicker>Why it exists</SectionKicker>
        <h2 className="mt-5 max-w-[14ch] bg-[linear-gradient(180deg,#9ca3af_0%,#d8dee6_46%,#ffffff_100%)] bg-clip-text text-[clamp(2rem,4.8vw,4.4rem)] font-semibold leading-none tracking-[-0.045em] text-transparent">
          A single endpoint cannot explain network health.
        </h2>
        <p className="mt-5 max-w-[58ch] text-sm leading-7 text-white/62">
          s0nar compares observer reports from different regions and writes the
          result on-chain. Users get a readable dashboard. Protocols get
          accounts they can verify.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PAIN_POINTS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            onPointerMove={setGlowAngle}
            className="feature-glow-card group relative min-h-56 overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(6,18,13,0.76),rgba(0,0,0,0.92))] p-5 transition-colors duration-300 hover:border-[#2DE19B]/24"
          >
            <div className="glow-container" aria-hidden="true">
              <div className="glow" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(45,225,155,0.46),transparent)] opacity-60"
            />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <span className="font-mono text-[12px] font-semibold tabular-nums text-[#2DE19B]/60">
                {item.number}
              </span>
              <div>
                <h3 className="max-w-full whitespace-nowrap text-[18px] font-semibold leading-tight tracking-[-0.03em] text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-[13px] leading-6 text-white/56">
                  {item.copy}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
