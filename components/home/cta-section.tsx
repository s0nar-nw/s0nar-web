import { ActionLink } from "@/components/sonar-ui";
import { SectionKicker } from "@/components/home/section-kicker";

export function CtaSection() {
  return (
    <section className="mx-auto mt-24 max-w-295 px-4">
      <div className="rounded-[28px] border border-[#2DE19B]/12 bg-[linear-gradient(180deg,rgba(4,16,12,0.92),rgba(0,0,0,0.98))] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-155">
            <SectionKicker>Get started</SectionKicker>
            <h2 className="mt-5 text-[clamp(1.8rem,4vw,3.4rem)] font-semibold uppercase leading-[0.92] tracking-[-0.08em] text-white">
              Start with the live network view.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-white/60">
              The fastest way to understand the product is to inspect the current score,
              regional split, and oracle state directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionLink href="/network" primary>
              Open network dashboard
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
