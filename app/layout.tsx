import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "s0nar",
  description: "The on-chain pulse of Solana's network health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body
        className="antialiased selection:bg-primary selection:text-primary-foreground"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
