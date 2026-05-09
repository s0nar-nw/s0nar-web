"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CiMenuFries } from "react-icons/ci";
import { IoClose } from "react-icons/io5";

const navItems = [
    { href: "/network", label: "Network" },
    { href: "/observers", label: "Observers" },
    { href: "/regions", label: "Regions" },
    { href: "/docs", label: "Docs" },
] as const;

function isActiveRoute(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export const Navbar1 = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const showNavLinks = pathname !== "/";

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="fixed inset-x-0 top-0 z-50 flex w-full justify-center px-4 py-4">
            <div
                className={[
                    "relative z-10 flex items-center rounded-full border border-neutral-900 bg-[rgba(0,8,5,0.72)] px-5 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl",
                    showNavLinks
                        ? "w-full max-w-5xl justify-between"
                        : "w-auto max-w-none gap-5 md:gap-8",
                ].join(" ")}
            >
                <Link
                    href="/"
                    className="flex items-center"
                    aria-label="s0nar home"
                >
                    <Image
                        src="/sonar-logo.svg"
                        alt="s0nar"
                        width={104}
                        height={26}
                        className="h-6 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                {showNavLinks && (
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const active = isActiveRoute(pathname, item.href);

                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ y: -1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={[
                                            "rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                                            active
                                                ? "bg-[#2de19b]/12 text-[#2de19b]"
                                                : "text-[rgba(245,255,249,0.44)] hover:bg-white/[0.04] hover:text-[rgba(245,255,249,0.82)]",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                )}

                {/* Desktop CTA Button */}
                <motion.div
                    className="hidden md:block"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#2de19b]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2de19b] animate-pulse" />
                        Devnet
                    </span>
                </motion.div>

                {/* Mobile Menu Button */}
                {showNavLinks && (
                    <motion.button
                        className="flex h-9 w-9 items-center justify-center md:hidden"
                        onClick={toggleMenu}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Open menu"
                    >
                        <CiMenuFries className="h-5 w-5 text-[#f5fff9]" />
                    </motion.button>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {showNavLinks && isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-[#080808] px-8 pt-20 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.button
                            className="absolute right-8 top-7 text-white/40 hover:text-white transition-colors"
                            onClick={toggleMenu}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Close menu"
                        >
                            <IoClose className="h-5 w-5" />
                        </motion.button>

                        <div className="flex flex-col">
                            {navItems.map((item, i) => {
                                const active = isActiveRoute(pathname, item.href);
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={[
                                                "flex items-center justify-between  py-5 text-[15px] font-medium tracking-wide transition-colors",
                                                active
                                                    ? "border-white/10 text-[#2de19b]"
                                                    : "border-white/[0.06] text-white/50 hover:text-white",
                                            ].join(" ")}
                                            onClick={toggleMenu}
                                        >
                                            {item.label}
                                            {active && (
                                                <span className="h-1 w-1 rounded-full bg-[#2de19b]" />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    delay: navItems.length * 0.06 + 0.1,
                                }}
                                className="mt-8"
                            >
                                <div className="flex items-center justify-between"
                                >
                                    <Link href="/" className="flex items-center" aria-label="s0nar home">
                                      <Image
                                        src="/sonar-logo.svg"
                                        alt="s0nar"
                                        width={104}
                                        height={26}
                                        className="h-6 w-auto"
                                        priority
                                      />
                                    </Link>
                                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
                                    <span className="h-1 w-1 rounded-full bg-[#2de19b]/60" />
                                    Devnet
                                </span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
           
        </div>
    );
};
