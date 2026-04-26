export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[12px] border border-white/8 bg-[rgba(4,14,10,0.7)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
      <span className="status-dot" aria-hidden="true" />
      {children}
    </div>
  );
}
