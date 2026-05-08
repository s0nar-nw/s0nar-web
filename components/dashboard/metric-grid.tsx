import { MetricCard } from "@/components/sonar-ui";

interface MetricItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
  /** Tailwind col-span class, e.g. "col-span-12 sm:col-span-6" */
  span?: string;
}

interface MetricGridProps {
  metrics: MetricItem[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className={metric.span ?? "col-span-12"}>
          <MetricCard
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            accent={metric.accent}
          />
        </div>
      ))}
    </div>
  );
}
