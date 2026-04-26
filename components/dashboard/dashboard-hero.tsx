import { MetricCard, Panel, StatusPill } from "@/components/sonar-ui";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  metrics: Array<{
    label: string;
    value: React.ReactNode;
    hint?: string;
    accent?: boolean;
  }>;
  sidebar?: React.ReactNode;
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  statusLabel,
  metrics,
  sidebar,
}: DashboardHeroProps) {
  return (
    <section
      className={cn(
        "mb-[3.2rem] grid gap-4",
        // two-column above 900px
        "min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch",
      )}
    >
      <Panel accent className="min-h-0">
        {/* header row */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
              {eyebrow}
            </div>
            <h2 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
              {title}
            </h2>
            <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
              {description}
            </p>
          </div>
          <StatusPill active>{statusLabel}</StatusPill>
        </div>

        {/* metrics strip */}
        <div className="mt-[1.45rem] grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              accent={metric.accent}
            />
          ))}
        </div>
      </Panel>

      {sidebar && (
        <Panel className="grid min-h-0 gap-[1.15rem] content-start">{sidebar}</Panel>
      )}
    </section>
  );
}
