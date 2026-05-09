import type { Metadata } from "next";
import { Geist, Google_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

const geist = Google_Sans({ subsets: ["latin"], variable: "--font-sans" });

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
