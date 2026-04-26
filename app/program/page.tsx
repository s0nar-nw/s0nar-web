"use client";

import { useState } from "react";
import {
  ActionLink,
  PageFrame,
  PageIntro,
  Panel,
  SectionTitle,
  StatusPill,
} from "@/components/sonar-ui";
import { CopyButton } from "@/components/copy-button";
import {
  EVENTS,
  INSTRUCTIONS,
  NETWORK_HEALTH_FIELDS,
  PDAS,
  REGISTRY_FIELDS,
} from "@/lib/sonar-static";
import { idl } from "@/lib/s0nar-idl";

const SCHEMAS = [
  { name: "NetworkHealthAccount", fields: NETWORK_HEALTH_FIELDS },
  { name: "RegistryAccount", fields: REGISTRY_FIELDS },
] as const;

// Shared table cell classes
const th = "border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-left align-middle text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[rgba(245,255,249,0.36)]";
const td = "border-b border-[rgba(255,255,255,0.08)] px-[0.82rem] py-[0.74rem] text-[0.72rem] leading-[1.45] align-middle text-[rgba(245,255,249,0.62)]";
const tdMono = `${td} font-mono [font-variant-numeric:tabular-nums] text-[rgba(245,255,249,1)]`;
const tdAccent = `${td} font-mono [font-variant-numeric:tabular-nums] text-[#2de19b]`;

export default function ProgramPage() {
  const [openSchema, setOpenSchema] = useState("NetworkHealthAccount");
  const programId = idl.address;

  return (
    <PageFrame>
      <PageIntro
        eyebrow="Anchor / Devnet"
        title="Program reference"
        description="Everything the client and the oracle consumers need: core addresses, instruction surface, account shapes, and event contracts."
        aside={<StatusPill active>Program live on devnet</StatusPill>}
      />

      {/* Program ID + PDAs */}
      <section className="mb-[3.2rem] grid gap-4 min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] min-[901px]:items-stretch">
        <Panel accent className="min-h-0">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2de19b]">
                Canonical address
              </div>
              <h2 className="mt-[0.9rem] text-[clamp(1.35rem,2.2vw,2rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
                Program ID
              </h2>
              <p className="mt-[0.95rem] max-w-lg text-[0.76rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">
                The single source of truth for explorer lookups, CPI consumers, and on-chain registry reads.
              </p>
            </div>
            <StatusPill active>Upgradeable</StatusPill>
          </div>

          <div className="mt-[1.45rem] break-all font-mono text-[0.84rem] leading-[1.75] text-[rgba(245,255,249,0.62)] [font-variant-numeric:tabular-nums]">
            {programId}
          </div>
          <div className="mt-[1.2rem] flex flex-wrap gap-3">
            <CopyButton text={programId} />
            <ActionLink href={`https://explorer.solana.com/address/${programId}?cluster=devnet`}>
              Explorer
            </ActionLink>
          </div>
        </Panel>

        <Panel className="min-h-0">
          <SectionTitle>Derived accounts</SectionTitle>
          <div className="grid gap-[1.15rem]">
            {PDAS.map((pda) => (
              <div
                key={pda.name}
                className="border-b border-[rgba(255,255,255,0.08)] pb-[0.95rem] last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="text-[0.92rem] font-semibold uppercase tracking-[-0.04em]">{pda.name}</div>
                  <StatusPill>{pda.size}</StatusPill>
                </div>
                <div className="mt-[0.55rem] font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                  seeds: {pda.seeds}
                </div>
                <p className="mt-[0.8rem] max-w-2xl text-[0.74rem] leading-[1.65] text-[rgba(245,255,249,0.62)]">
                  {pda.desc}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Instruction surface */}
      <section className="mb-[3.2rem] grid gap-4">
        <SectionTitle
          action={
            <span className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              {INSTRUCTIONS.length} public instructions
            </span>
          }
        >
          Instruction surface
        </SectionTitle>
        <div className="relative overflow-auto rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Instruction</th>
                <th className={th}>Caller</th>
                <th className={th}>Behavior</th>
              </tr>
            </thead>
            <tbody>
              {INSTRUCTIONS.map((instruction) => (
                <tr key={instruction.name} className="hover:bg-black/80">
                  <td className={tdAccent}>{instruction.name}</td>
                  <td className={td}>{instruction.caller}</td>
                  <td className={td}>{instruction.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Account schemas */}
      <section className="mb-[3.2rem] grid gap-4">
        <SectionTitle>Account schemas</SectionTitle>
        <div className="grid gap-[1.15rem]">
          {SCHEMAS.map((schema) => {
            const open = openSchema === schema.name;
            return (
              <section
                key={schema.name}
                className="overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(4,14,10,0.86),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenSchema(open ? "" : schema.name)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-[0.95rem] pb-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
                >
                  <span className="text-[0.92rem] font-semibold uppercase tracking-[-0.04em]">
                    {schema.name}
                  </span>
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
                    {open ? "Close" : "Open"}
                  </span>
                </button>
                {open && (
                  <div className="overflow-auto border-t border-[rgba(255,255,255,0.1)]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className={th}>Field</th>
                          <th className={th}>Type</th>
                          <th className={th}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schema.fields.map((field) => (
                          <tr key={field.field} className="hover:bg-black/80">
                            <td className={tdMono}>{field.field}</td>
                            <td className={tdAccent}>{field.type}</td>
                            <td className={td}>{field.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {/* Events + score model */}
      <section className="grid gap-4">
        <SectionTitle>Events and score model</SectionTitle>
        <div className="grid gap-4 min-[901px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Panel>
            <div className="grid gap-[1.15rem]">
              {EVENTS.map((event) => (
                <div
                  key={event.name}
                  className="border-b border-[rgba(255,255,255,0.08)] pb-[0.95rem] last:border-0 last:pb-0"
                >
                  <div className="text-[0.92rem] font-semibold uppercase tracking-[-0.04em]">{event.name}</div>
                  <p className="mt-[0.8rem] max-w-2xl text-[0.74rem] leading-[1.65] text-[rgba(245,255,249,0.62)]">{event.desc}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Code block */}
          <div className="relative overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] p-[0.9rem] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5">
            <div className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
              Score formula
            </div>
            <pre className="mt-4 overflow-auto font-mono text-[0.74rem] leading-[1.6] text-[rgba(245,255,249,0.62)]">{`observer_score = (reachability_pct * 0.70) + (latency_score * 0.30)
latency_score = max(0, (400 - slot_latency_ms) / 400 * 100)
global_score  = avg(non_stale_region_scores)

stale_threshold = 150 slots`}</pre>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
