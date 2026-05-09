import Link from "next/link";
import { cn } from "@/lib/utils";

// PageFrame
export function PageFrame({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className={cn(
        "mx-auto px-[1.1rem] pb-[4.8rem] pt-[7.4rem] max-md:pt-[6.2rem]",
        wide ? "max-w-7xl" : "max-w-290",
      )}
    >
      {children}
    </main>
  );
}

// Eyebrow
export function Eyebrow({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.45rem] rounded-[12px] border px-[0.7rem] py-[0.45rem] text-[0.64rem] font-semibold uppercase tracking-[0.18em]",
        accent
          ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.86)] text-[#2de19b]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(4,14,10,0.78)] text-[rgba(245,255,249,0.36)]",
      )}
    >
      {children}
    </span>
  );
}

// PageIntro
export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="mb-[3.2rem] flex flex-wrap items-end justify-between gap-[2.4rem] max-[900px]:items-start">
      <div className="max-w-195">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-[clamp(1.55rem,4.4vw,3.8rem)] font-semibold uppercase leading-none tracking-[-0.045em] sm:tracking-[-0.06em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-200 text-[0.82rem] leading-[1.7] text-[rgba(245,255,249,0.62)]">
            {description}
          </p>
        ) : null}
      </div>
      {aside ? <div>{aside}</div> : null}
    </section>
  );
}

// SectionTitle
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-[0.65rem]">
      <div className="whitespace-nowrap text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)]">
        {children}
      </div>
      <div className="h-px min-w-10 flex-1 bg-[linear-gradient(90deg,rgba(45,225,155,0.24),transparent)]" />
      {action ? <div className="max-sm:hidden">{action}</div> : null}
    </div>
  );
}

// Panel
export function Panel({
  children,
  accent = false,
  className,
}: {
  children: React.ReactNode;
accent?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        // base
        "relative overflow-hidden rounded-[16px] border p-[1.3rem] backdrop-blur-[18px]",
        "bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))]",
        "shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        // shimmer overlay
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(45,225,155,0.08),transparent_34%),linear-gradient(180deg,rgba(45,225,155,0.02),transparent_44%)] before:opacity-50",
        // inner top-edge highlight
        "after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5",
        // accent vs default border
        accent
          ? "border-[rgba(45,225,155,0.24)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.28),0_24px_64px_rgba(45,225,155,0.08)]"
          : "border-[rgba(255,255,255,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

// MetricCard
export function MetricCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-30 overflow-hidden rounded-[16px] border p-[1rem_1rem_1.05rem] backdrop-blur-[18px]",
        "bg-[linear-gradient(180deg,rgba(4,14,10,0.9),rgba(0,0,0,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(45,225,155,0.08),transparent_34%),linear-gradient(180deg,rgba(45,225,155,0.02),transparent_44%)] before:opacity-50",
        "after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:border-t after:border-white/5",
        accent
          ? "border-[rgba(45,225,155,0.24)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.28),0_24px_64px_rgba(45,225,155,0.08)]"
          : "border-[rgba(255,255,255,0.06)]",
      )}
    >
      <div className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
        {label}
      </div>
      <div className="relative z-10 mt-[0.9rem] font-variant-numeric: tabular-nums text-[clamp(1.12rem,2.5vw,1.9rem)] font-semibold uppercase leading-[0.92] tracking-[-0.08em] [font-variant-numeric:tabular-nums]">
        {value}
      </div>
      {hint ? (
        <div className="relative z-10 mt-[0.8rem] text-[0.66rem] font-semibold uppercase leading-[1.55] tracking-[0.18em] text-[rgba(245,255,249,0.36)]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

// StatusPill
export function StatusPill({
  children,
  active = false,
  tone,
}: {
  children: React.ReactNode;
  active?: boolean;
  tone?: "neutral";
}) {
  const neutral = tone === "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.4rem] rounded-[12px] border px-[0.62rem] py-[0.42rem] text-[0.64rem] font-semibold uppercase tracking-[0.18em]",
        neutral
          ? "border-[rgba(255,255,255,0.1)] bg-black/80 text-[rgba(245,255,249,0.62)]"
          : active
          ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.86)] text-[#2de19b]"
          : "border-[rgba(255,75,105,0.28)] bg-[rgba(50,8,16,0.82)] text-[#ff4b69]",
      )}
    >
      {neutral ? (
        <span
          className="h-[0.38rem] w-[0.38rem] rounded-full bg-[rgba(245,255,249,0.42)]"
          aria-hidden="true"
        />
      ) : active ? (
        <span
          className="h-[0.38rem] w-[0.38rem] rounded-full bg-[#2de19b] shadow-[0_0_0.9rem_rgba(45,225,155,0.24)]"
          aria-hidden="true"
        />
      ) : (
        <span
          className="h-[0.38rem] w-[0.38rem] rounded-full bg-[#ff4b69] shadow-[0_0_0.9rem_rgba(255,75,105,0.24)]"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(45,225,155,0.12),rgba(255,255,255,0.06))] bg-size-[220%_100%]",
        className,
      )}
    />
  );
}

export function PageIntroSkeleton({ title = "Loading" }: { title?: string }) {
  return (
    <section className="mb-[3.2rem] flex flex-wrap items-end justify-between gap-[2.4rem] max-[900px]:items-start">
      <div className="w-full max-w-195">
        <Skeleton className="h-8 w-36 rounded-[12px]" />
        <Skeleton className="mt-4 h-[clamp(2.1rem,4.4vw,4rem)] w-full max-w-104" />
        <Skeleton className="mt-4 h-[0.9rem] w-full max-w-2xl" />
        <Skeleton className="mt-3 h-[0.9rem] w-full max-w-124" />
      </div>
      <Skeleton
        className="h-8 w-44 rounded-[12px]"
        aria-label={title}
      />
    </section>
  );
}

// KeyValueList
export function KeyValueList({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid gap-[0.95rem]">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-5 border-b border-[rgba(255,255,255,0.08)] pb-[0.95rem] text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.36)] [&>span:last-child]:text-right [&>span:last-child]:tracking-[0.04em] [&>span:last-child]:text-[rgba(245,255,249,1)]"
        >
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// Bars
export function Bars({
  values,
  accentIndex,
}: {
  values: number[];
  accentIndex?: number;
}) {
  return (
    <div className="flex h-[5.6rem] items-end gap-[0.4rem]">
      {values.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className={cn(
            "flex-1 rounded-t-full",
            accentIndex === index
              ? "bg-[linear-gradient(180deg,#2de19b,rgba(45,225,155,0.25))] shadow-[0_0_1rem_rgba(45,225,155,0.25)]"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]",
          )}
          style={{ height: `${value}%` }}
        />
      ))}
    </div>
  );
}

// ActionLink
export function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      className={cn(
        // Base
        "group relative inline-flex min-h-10 items-center justify-center gap-1.5 overflow-hidden rounded-[14px] border px-4 text-[0.78rem] font-semibold tracking-[-0.01em] transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",

        primary
          ? [
              // Primary — solid green
              "border-[rgba(45,225,155,0.28)] bg-[#2de19b] text-[#01100a]",
              // Layered glow: tight bloom + wide ambient
              "shadow-[0_0_0_1px_rgba(45,225,155,0.18)_inset,0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_24px_rgba(45,225,155,0.18),0_2px_8px_rgba(45,225,155,0.12)]",
              // Hover: brighter + lift
              "hover:bg-[#3fffa8] hover:shadow-[0_0_0_1px_rgba(45,225,155,0.22)_inset,0_1px_0_rgba(255,255,255,0.28)_inset,0_12px_32px_rgba(45,225,155,0.26),0_4px_12px_rgba(45,225,155,0.18)] hover:-translate-y-0.5",
              // Active
              "active:translate-y-0 active:shadow-[0_0_0_1px_rgba(45,225,155,0.16)_inset,0_4px_12px_rgba(45,225,155,0.14)]",
            ].join(" ")
          : [
              "border-[rgba(255,255,255,0.09)] bg-[rgba(3,12,9,0.82)] text-[rgba(230,255,242,0.88)]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]",
              // Hover
              "hover:border-[rgba(45,225,155,0.22)] hover:bg-[rgba(8,28,18,0.92)] hover:text-[rgba(230,255,242,1)] hover:shadow-[0_0_0_1px_rgba(45,225,155,0.08)_inset,0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_16px_rgba(45,225,155,0.06)] hover:-translate-y-0.5",
              // Active
              "active:translate-y-0 active:bg-[rgba(3,12,9,0.92)]",
            ].join(" "),
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
