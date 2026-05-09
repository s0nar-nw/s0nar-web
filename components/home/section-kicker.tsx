export function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#2DE19B]/24 bg-[rgba(4,16,12,0.86)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2DE19B]">
      <span
        className="h-[0.38rem] w-[0.38rem] rounded-full bg-[#2DE19B] shadow-[0_0_0.9rem_rgba(45,225,155,0.24)]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
