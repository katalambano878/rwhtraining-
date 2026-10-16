"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/siteData";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || !isHome
            ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between">

            {/* ── Logo ── */}
            <Link href="/" className="relative z-50 flex items-center group">
              <Image
                src={isScrolled || !isHome ? "/brand/logo.svg" : "/brand/logo-on-dark.svg"}
                alt="Remote Work Hub"
                width={256}
                height={40}
                className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
                unoptimized
              />
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { label: "Curriculum", href: sectionHref("curriculum") },
                { label: "Portfolio", href: sectionHref("portfolio") },
                { label: "Challenge", href: sectionHref("challenge") },
                { label: "Internship", href: sectionHref("internship") },
                { label: "FAQ", href: sectionHref("faq") },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                    isScrolled || !isHome
                      ? "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="hidden lg:flex items-center gap-3 relative z-50">
              {/* Seats badge */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md border text-[11px] font-bold transition-all",
                isScrolled || !isHome
                  ? "bg-amber-50 border-amber-200/60 text-amber-700"
                  : "bg-amber-500/20 border-amber-400/30 text-amber-200"
              )}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                Only 10 Seats Available
              </div>

              <Link
                href="/apply"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                Secure Your Seat
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className={cn(
                "lg:hidden relative z-50 p-2 -mr-2 rounded-lg transition-colors",
                mobileOpen
                  ? "text-slate-800"
                  : isScrolled || !isHome ? "text-slate-800" : "text-white"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div
              className="fixed top-0 right-0 bottom-0 z-40 w-[85%] max-w-sm bg-white shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full pt-20 pb-6 px-6">
                <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
                  <Link href={sectionHref("curriculum")} className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Curriculum
                  </Link>
                  <Link href={sectionHref("portfolio")} className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Portfolio
                  </Link>
                  <Link href={sectionHref("challenge")} className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Challenge
                  </Link>
                  <Link href={sectionHref("internship")} className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Internship
                  </Link>
                  <Link href={sectionHref("faq")} className="flex items-center px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                    FAQ
                  </Link>
                </nav>

                <div className="pt-6 flex flex-col gap-3 border-t border-slate-100 mt-auto">
                  <a
                    href={`tel:${brand.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {brand.phone}
                  </a>
                  <Link
                    href="/apply"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Secure Your Seat
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
}
