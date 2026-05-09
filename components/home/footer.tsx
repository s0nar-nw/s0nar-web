import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/network",   label: "Network health" },
  { href: "/regions",   label: "Regions" },
  { href: "/observers", label: "Observers" },
  { href: "/docs",      label: "SDK docs" },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://github.com/s0nar-nw",
    label: "GitHub",
  },
  {
    href: "https://x.com/s0naronline",
    label: "X",
  },
] as const;

type FooterLink = { href: string; label: string };
type SocialLink = (typeof SOCIAL_LINKS)[number];

function FooterLinks({ links }: { links: readonly FooterLink[] }) {
  return (
    <div>
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2DE19B]">
        Explore
      </h2>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[13px] leading-5 text-white/52 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2DE19B]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialLinks({ links }: { links: readonly SocialLink[] }) {
  return (
    <div>
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2DE19B]">
        Socials
      </h2>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] leading-5 text-white/52 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2DE19B]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-28 max-w-295 px-4 pb-10">
      <div className="border-t border-white/8 pt-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.65fr)]">
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label="s0nar home">
              <Image
                src="/sonar-logo.svg"
                alt="s0nar"
                width={116}
                height={28}
                className="h-6 w-auto"
              />
            </Link>

            <p className="max-w-[48ch] text-[13px] leading-6 text-white/52">
                Distributed visibility for Solana health.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2DE19B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DE19B]" />
                Devnet
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">
                Built on
              </span>
              <Image
                src="/solanaLogo.svg"
                alt="Solana"
                width={72}
                height={12}
                className="h-3 w-auto opacity-80"
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end">
            <nav aria-label="Footer">
              <FooterLinks links={FOOTER_LINKS} />
            </nav>
            <SocialLinks links={SOCIAL_LINKS} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
          <span>&copy;2026 s0nar. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
