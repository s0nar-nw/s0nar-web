import type { Metadata } from "next";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
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
