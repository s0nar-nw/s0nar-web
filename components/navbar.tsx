"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/network", label: "Network" },
  { href: "/observers", label: "Observers" },
  { href: "/regions", label: "Regions" },
  // { href: "/program", label: "Program" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [slot, setSlot] = useState(287442108);
  const [score, setScore] = useState(87);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlot((value) => value + Math.floor(Math.random() * 3 + 1));
      setScore((value) => {
        const delta = Math.random() > 0.65 ? 1 : 0;
        return Math.min(99, Math.max(84, value + delta));
      });
    }, 1200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "z-20 px-4 pt-4",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex flex-wrap items-center justify-between gap-[0.65rem] rounded-[16px] border-[rgba(255,255,255,0.08)] bg-transparent px-10 py-[0.65rem] backdrop-blur-md transition-shadow duration-200",
          scrolled && "shadow-[0_18px_44px_rgba(0,0,0,0.24)]",
          "relative overflow-hidden",
          "max-[900px]:items-start",
        )}
      >
        <Link href="/" aria-label="s0nar home">
          <Image
            src="/sonar-logo.svg"
            alt="s0nar"
            width={116}
            height={28}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "flex flex-wrap items-center gap-[0.4rem]",
            isHome && "max-[900px]:hidden",
          )}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[12px] border px-[0.78rem] py-[0.52rem] text-[0.66rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]",
                  active
                    ? "border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.78)] text-[rgba(245,255,249,1)]"
                    : "border-transparent text-[rgba(245,255,249,0.36)] hover:border-[rgba(45,225,155,0.24)] hover:bg-[rgba(4,16,12,0.78)] hover:text-[rgba(245,255,249,1)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "flex flex-wrap items-center justify-end gap-[0.4rem]",
            isHome && "max-[900px]:hidden",
          )}
        >
          <div className="inline-flex min-h-[2.2rem] items-center gap-[0.45rem] rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(1,6,4,0.96)] px-3 text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(245,255,249,0.62)]">
            <span>score</span>
            <strong className="text-[0.72rem] tracking-[0.04em] text-[rgba(245,255,249,1)]">{score}</strong>
          </div>
          <div className="inline-flex min-h-[2.2rem] items-center gap-[0.45rem] rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(1,6,4,0.96)] px-3 text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(245,255,249,0.62)]">
            <span>slot</span>
            <strong className="text-[0.69rem] tracking-[0.04em] text-[rgba(245,255,249,1)]">{slot.toLocaleString()}</strong>
          </div>
          <div className="inline-flex min-h-[2.2rem] items-center gap-[0.45rem] rounded-[12px] border border-[rgba(45,225,155,0.24)] bg-[rgba(4,16,12,0.84)] px-3 text-[0.62rem] uppercase tracking-[0.16em] text-[#2de19b]">
            <span className="h-[0.38rem] w-[0.38rem] rounded-full bg-[#2de19b] shadow-[0_0_0.9rem_rgba(45,225,155,0.24)]" aria-hidden="true" />
            live
          </div>
        </div>
      </div>
    </header>
  );
}
