import { Bars, Panel, SectionTitle, StatusPill } from "@/components/sonar-ui";

interface ScoreMomentumPanelProps {
  score: number;
  history: number[];
}

export function ScoreMomentumPanel({ score, history }: ScoreMomentumPanelProps) {
  return (
    <Panel accent>
      <SectionTitle>Score momentum</SectionTitle>

      <div className="grid gap-8 min-[901px]:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1fr)] min-[901px]:items-center">
        <div className="grid gap-5 content-start">
          <div>
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              Current score
            </div>
            <div className="mt-[0.7rem] text-[clamp(3.2rem,8vw,5rem)] font-semibold leading-[0.88] tracking-[-0.11em] text-[#2de19b] [font-variant-numeric:tabular-nums]">
              {score}
            </div>
            <p className="mt-[0.95rem] max-w-136 text-[0.76rem] leading-[1.7] text-[rgba(245,255,249,0.62)]">
              Strong enough to stay in the healthy band, but still responsive to regional lag.
            </p>
          </div>

          <div className="grid gap-[0.85rem]">
            {[
              { label: "Floor", value: "82" },
              { label: "Ceiling", value: "94" },
              { label: "Window size", value: "20" },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  {label}
                </span>
                <strong className="mt-[0.35rem] block text-[1rem] font-semibold leading-none tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <StatusPill active>Healthy range</StatusPill>
        </div>

        <div className="border-l border-[rgba(255,255,255,0.08)] pl-[1.4rem] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-t-[rgba(255,255,255,0.08)] max-[900px]:pl-0 max-[900px]:pt-[1.4rem]">
          <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            Last 20 windows
          </div>
          <div className="mt-5">
            <Bars values={history} accentIndex={history.length - 1} />
          </div>
          <div className="mt-[0.85rem] flex justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            <span>200s ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
