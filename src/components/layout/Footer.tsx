import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Globe, ShieldCheck } from "lucide-react";
import { brand } from "@/lib/siteData";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="bg-[#0a192f] text-white pt-20 pb-8 overflow-hidden relative">
      {/* Glow */}
      <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

          {/* Brand & CTA */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <Link href="/" className="inline-flex items-center mb-4">
                <Image
                  src="/brand/logo-endorsed-on-dark.svg"
                  alt="Remote Work Hub, by Doctor Barns Tech"
                  width={300}
                  height={47}
                  className="h-12 w-auto"
                  unoptimized
                />
              </Link>
              <p className="text-slate-400 font-light text-base max-w-sm leading-relaxed">
                The premier Elite Web Development &amp; SaaS Masterclass in Ghana. We engineer beginners into highly capable developers with a Professional Diploma and 1-month internship pathway.
              </p>
            </div>

            <Link
              href="/apply"
              className="inline-flex items-center gap-2 h-12 px-8 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 group"
            >
              Secure Your Seat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={brand.social.instagram}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors text-[10px] font-bold"
              >
                IG
              </a>
              <a
                href={brand.social.facebook}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors text-[10px] font-bold"
              >
                FB
              </a>
              <a
                href={brand.social.twitter}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors text-[10px] font-bold"
              >
                X
              </a>
              <a
                href={brand.social.linkedin}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors text-[10px] font-bold"
              >
                LI
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              The Program
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Curriculum", href: "/#curriculum" },
                { label: "Portfolio Systems", href: "/#portfolio" },
                { label: "Internship Bonus", href: "/#internship" },
                { label: "100K Challenge", href: "/#challenge" },
                { label: "Contact Us", href: "/contact" },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-blue-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-6 border-b border-white/10 pb-4">
              Contact Us
            </h4>
            <ul className="space-y-5 text-sm text-slate-400">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-light">111 Newtown RD,<br />Accra Newtown</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-white transition-colors font-light">
                  +233 20 963 6158
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-light">
                  remoteworkhub.org
                </a>
              </li>
            </ul>

            {/* Next cohort callout */}
            <div className="mt-8 p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Only 10 Seats Available</p>
              <p className="text-white font-bold text-base">One-Time Fee: GHS 1,000</p>
              <p className="text-slate-400 text-xs mt-1">Curriculum · Portfolio · Internship · Challenge</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-light">
          <p className="max-w-2xl text-center md:text-left">
            © 2026 Remote Work Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
