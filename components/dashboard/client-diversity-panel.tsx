import { Panel, SectionTitle } from "@/components/sonar-ui";
import { type ClientDiversityItem } from "@/lib/sonar-static";

function percent(count: number, totalValidators: number) {
  if (totalValidators === 0) return 0;
  return Math.round((count / totalValidators) * 1000) / 10;
}

export function ClientDiversityPanel({ clients }: { clients: readonly ClientDiversityItem[] }) {
  const totalValidators = clients.reduce((sum, client) => sum + client.count, 0);
  const nonAgaveValidators = clients.reduce(
    (sum, client) => sum + (client.name === "Agave" ? 0 : client.count),
    0,
  );
  const representedClients = clients.filter((client) => client.count > 0).length;

  return (
    <Panel accent>
      <SectionTitle
        action={
          <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            {representedClients} clients seen
          </span>
        }
      >
        Client diversity
      </SectionTitle>

      <div className="grid gap-6 min-[901px]:grid-cols-[minmax(12rem,0.34fr)_minmax(0,1fr)] min-[901px]:items-end">
        <div>
          <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
            Validators sampled
          </div>
          <div className="mt-3 flex items-end gap-2">
            <strong className="text-[clamp(3rem,7vw,5.2rem)] font-semibold leading-[0.82] tracking-[-0.1em] text-white [font-variant-numeric:tabular-nums]">
              {totalValidators}
            </strong>
            <span className="pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/36">
              total
            </span>
          </div>
          <div className="mt-4 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-4">
            <div className="font-mono text-[1.35rem] font-semibold text-[#2de19b]">
              {percent(nonAgaveValidators, totalValidators)}%
            </div>
            <div className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
              non-agave share
            </div>
          </div>
          <div className="mt-3 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 p-4">
            <div className="font-mono text-[1.35rem] font-semibold text-white">
              CPI
            </div>
            <div className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
              readable signal
            </div>
          </div>
        </div>

        <div>
          <div className="flex h-3 overflow-hidden rounded-full bg-white/8">
            {clients.map((client) => (
              <span
                key={client.name}
                className="min-w-px"
                style={{
                  width: `${percent(client.count, totalValidators)}%`,
                  backgroundColor: client.color,
                }}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <div
                key={client.name}
                className="flex min-h-[4.2rem] items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-black/25 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_12px_currentColor]"
                    style={{
                      backgroundColor: client.color,
                      color: client.color,
                    }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-[0.78rem] font-semibold text-white/78">
                    {client.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2 font-mono">
                  <span className="text-[0.84rem] font-semibold text-white">
                    {client.count}
                  </span>
                  <span className="text-[0.68rem] text-white/36">
                    {percent(client.count, totalValidators)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
