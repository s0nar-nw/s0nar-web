"use client";

import { SectionKicker } from "@/components/home/section-kicker";
import { motion } from "motion/react";

const STEPS = [
  {
    title: "Observe",
    copy: "Observers test whether Solana is reachable from their region.",
  },
  {
    title: "Measure",
    copy: "They record slot latency and reachability for that region.",
  },
  {
    title: "Publish",
    copy: "Fresh reports update the s0nar program on devnet.",
  },
  {
    title: "Inspect",
    copy: "The app shows the score, regions, observers, and account state.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto mt-28 max-w-295 px-4">
      <div className="max-w-205">
        <SectionKicker>How it works</SectionKicker>
        <h2 className="mt-5 max-w-[13ch] bg-[linear-gradient(180deg,#9ca3af_0%,#d8dee6_46%,#ffffff_100%)] bg-clip-text text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-transparent">
          Observer reports become a readable network score.
        </h2>
        <p className="mt-5 max-w-[48ch] text-[14px] leading-7 text-white/60">
          s0nar does not guess. It turns recent observer reports into
          <strong className="font-semibold text-white mr-1"> regional scores</strong>
          and one global score that is easy to inspect.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="relative min-h-44 rounded-[20px] border border-[#2DE19B]/20 bg-[linear-gradient(145deg,rgba(8,28,18,0.88),rgba(0,0,0,0.94)_62%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_rgba(0,0,0,0.28)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_18%_18%,rgba(45,225,155,0.12),transparent_34%)] before:opacity-80 after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5"
          >
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-full top-1/2 z-10 hidden h-px w-7 -translate-y-1/2 bg-[linear-gradient(90deg,rgba(45,225,155,0.22),rgba(45,225,155,0.95),rgba(45,225,155,0.22))] shadow-[0_0_14px_rgba(45,225,155,0.55)] lg:block"
              >
                <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2DE19B] shadow-[0_0_12px_rgba(45,225,155,0.75)]" />
                <span className="absolute right-0 top-1/2 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2DE19B] shadow-[0_0_12px_rgba(45,225,155,0.75)]" />
              </span>
            ) : null}

            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[17px] font-semibold leading-tight tracking-[-0.03em] text-white">
                  {step.title}
                </h3>
                <span className="font-mono text-[12px] font-semibold tabular-nums text-[#2DE19B]/64">
                  0{index + 1}
                </span>
              </div>
              <p className="text-[13px] leading-6 text-white/56">
                {step.copy}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
