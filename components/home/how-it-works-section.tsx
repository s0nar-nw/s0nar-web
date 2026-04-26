import { ActionLink } from "@/components/sonar-ui";
import { SectionKicker } from "@/components/home/section-kicker";

const STEPS = [
  "Observers measure reachability and slot latency.",
  "Attestations are written on-chain.",
  "Regional scores roll up into one oracle surface.",
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto mt-24 max-w-295 px-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[24px] border border-white/8 bg-[rgba(2,10,7,0.8)] p-6">
          <SectionKicker>How it works</SectionKicker>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step} className="rounded-[18px] border border-white/8 bg-[rgba(0,0,0,0.78)] p-4">
                <div className="text-[22px] font-semibold leading-none tracking-[-0.08em] text-[#2DE19B]">
                  0{index + 1}
                </div>
                <p className="mt-3 text-[13px] leading-6 text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[rgba(0,0,0,0.8)] p-6">
          <SectionKicker>Open the product</SectionKicker>
          <div className="mt-5 grid gap-3">
            <ActionLink href="/network" primary>
              Network dashboard
            </ActionLink>
            <ActionLink href="/observers">Observer registry</ActionLink>
            <ActionLink href="/regions">Regional breakdown</ActionLink>
            {/* <ActionLink href="/program">Program reference</ActionLink> */}
          </div>
        </div>
      </div>
    </section>
  );
}
