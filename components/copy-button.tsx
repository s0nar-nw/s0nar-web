"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex min-h-[2.6rem] items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(3,12,9,0.82)] px-[0.9rem] text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,255,249,1)] shadow-[0_18px_44px_rgba(0,0,0,0.24)] transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-[rgba(45,225,155,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2de19b]"
    >
      {copied ? "Copied" : "Copy address"}
    </button>
  );
}
