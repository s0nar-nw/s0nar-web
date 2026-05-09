import { Navbar1 } from "./navbar";


export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-black"
      />
      {/* noise overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.085] bg-[url('/pixels.svg')] bg-size-[300px_300px]"
      />
      {/* grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.22] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(circle_at_center,black,transparent_88%)]"
      />
      <Navbar1 />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
