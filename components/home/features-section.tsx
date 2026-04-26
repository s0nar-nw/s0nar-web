import { SectionKicker } from "@/components/home/section-kicker";

const FEATURES = [
  {
    title: "Shared network view",
    copy: "One global score built from regional observer data.",
  },
  {
    title: "Operator transparency",
    copy: "See who is active, where they run, and how they perform.",
  },
  {
    title: "Readable on-chain",
    copy: "Program state, PDAs, and schemas are easy to inspect.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="mx-auto mt-24 max-w-295 px-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-[24px] border border-white/8 bg-[rgba(2,10,7,0.8)] p-6">
          <SectionKicker>Why it matters</SectionKicker>
          <h2 className="mt-5 text-[clamp(1.6rem,3.5vw,2.8rem)] font-semibold uppercase leading-[0.94] tracking-[-0.07em] text-white">
            A clean answer to a messy network question.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[14px] leading-7 text-white/60">
            Most teams only see their own provider, their own probes, or their own
            dashboards. s0nar publishes a shared, inspectable health view instead.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="min-h-32 rounded-[18px] border border-white/8 bg-[rgba(0,0,0,0.76)] p-5"
            >
              <h3 className="text-[16px] font-semibold uppercase tracking-[-0.04em] text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-[13px] leading-6 text-white/58">{feature.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
