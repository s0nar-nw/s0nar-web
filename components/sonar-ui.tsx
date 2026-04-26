import Link from "next/link";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PageFrame
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Eyebrow
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// PageIntro
// ---------------------------------------------------------------------------
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
        <h1 className="mt-4 text-[clamp(1.7rem,4.4vw,3.8rem)] font-semibold uppercase leading-none tracking-[-0.06em]">
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

// ---------------------------------------------------------------------------
// SectionTitle
// ---------------------------------------------------------------------------
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-[0.65rem]">
      <div className="whitespace-nowrap text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,0.62)]">
        {children}
      </div>
      <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(45,225,155,0.24),transparent)]" />
      {action ? <div>{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// StatusPill
// ---------------------------------------------------------------------------
export function StatusPill({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.4rem] rounded-[12px] border px-[0.62rem] py-[0.42rem] text-[0.64rem] font-semibold uppercase tracking-[0.18em]",
        active
          ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.86)] text-[#2de19b]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(3,12,9,0.8)] text-[rgba(245,255,249,0.36)]",
      )}
    >
      {active ? <span className="h-[0.38rem] w-[0.38rem] rounded-full bg-[#2de19b] shadow-[0_0_0.9rem_rgba(45,225,155,0.24)]" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(45,225,155,0.12),rgba(255,255,255,0.06))] bg-[length:220%_100%]",
        className,
      )}
    />
  );
}

export function PageIntroSkeleton({ title = "Loading" }: { title?: string }) {
  return (
    <section className="mb-[3.2rem] flex flex-wrap items-end justify-between gap-[2.4rem] max-[900px]:items-start">
      <div className="w-full max-w-195">
        <Skeleton className="h-[2rem] w-[9rem] rounded-[12px]" />
        <Skeleton className="mt-4 h-[clamp(2.1rem,4.4vw,4rem)] w-full max-w-[26rem]" />
        <Skeleton className="mt-4 h-[0.9rem] w-full max-w-[42rem]" />
        <Skeleton className="mt-3 h-[0.9rem] w-full max-w-[31rem]" />
      </div>
      <Skeleton className="h-[2rem] w-[11rem] rounded-[12px]" aria-label={title} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// KeyValueList
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Bars
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// ActionLink
// ---------------------------------------------------------------------------
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
        "inline-flex min-h-[2.6rem] items-center justify-center rounded-[12px] border px-[0.9rem] text-[0.64rem] font-semibold uppercase tracking-[0.18em] transition-[transform,border-color,background-color,color,box-shadow] duration-150 ease-out hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
        primary
          ? "border-[rgba(45,225,155,0.24)] bg-[#2de19b] text-[#02110b] shadow-[0_14px_34px_rgba(45,225,155,0.14),0_0_2.4rem_rgba(45,225,155,0.12)] hover:border-[rgba(45,225,155,0.24)]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(3,12,9,0.82)] text-[rgba(245,255,249,1)] shadow-[0_18px_44px_rgba(0,0,0,0.24)] hover:border-[rgba(45,225,155,0.24)]",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
