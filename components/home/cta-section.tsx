"use client"
import { ActionLink } from "@/components/sonar-ui";
import { SectionKicker } from "@/components/home/section-kicker";
import { motion } from "motion/react";

const START_PATHS = [
  {
    title: "Wallets and apps",
    eyebrow: "Product teams",
    copy: "Show users whether Solana is healthy before they send, swap, mint, or retry a failed action.",
    href: "/network",
    action: "View network",
    accent: true,
  },
  {
    title: "Observer operators",
    eyebrow: "Infrastructure",
    copy: "Track active observers, regional coverage, and the latest reported state from your node fleet.",
    href: "/observers",
    action: "View observers",
    accent: false,
  },
] as const;

export function CtaSection() {
  return (
    <section className="mx-auto mt-24 max-w-295 px-4">
      <div className="max-w-205">
        <SectionKicker>Who's it for</SectionKicker>
        <h2 className="mt-5 max-w-[14ch] bg-[linear-gradient(180deg,#9ca3af_0%,#d8dee6_46%,#ffffff_100%)] bg-clip-text text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-transparent">
          Network health for teams that need live context.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[14px] leading-7 text-white/60">
          s0nar is built for apps, operators, and protocols that need a clearer
          view of Solana health than a single RPC response can provide.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {START_PATHS.map((path, i) => (
          <motion.div
            key={path.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={[
              "flex min-h-62 flex-col gap-5 rounded-[20px] p-5 transition-colors duration-300",
              path.accent
                ? "border border-[#2DE19B]/22 bg-[rgba(8,28,20,0.66)] hover:border-[#2DE19B]/38"
                : "border border-white/8 bg-[linear-gradient(180deg,rgba(4,14,10,0.72),rgba(0,0,0,0.9))] hover:border-white/14",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                {path.title}
              </h3>
              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium tracking-wide",
                  path.accent
                    ? "border border-[#2DE19B]/22 text-[#2DE19B]/80"
                    : "border border-white/10 text-white/38",
                ].join(" ")}
              >
                {path.eyebrow}
              </span>
            </div>

            <p className="flex-1 text-[13px] leading-[1.65] text-white/55">
              {path.copy}
            </p>

            <ActionLink
              href={path.href}
              primary={path.accent}
            >
              {path.action}
            </ActionLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
