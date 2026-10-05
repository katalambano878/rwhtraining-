"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Code2, Database, CreditCard, LayoutDashboard,
  Megaphone, BookOpen, Zap, Clock, Users, Award, Download, Calendar,
  Layers, Server, Globe, ShoppingCart, Monitor, GraduationCap
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { brand, curriculum } from "@/lib/siteData";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const weekIcons = [BookOpen, Code2, Database, CreditCard, LayoutDashboard, Megaphone];

const weekColors = {
  blue: {
    badge: "bg-blue-600 text-white",
    border: "border-blue-200 hover:border-blue-400",
    bg: "bg-blue-50",
    bullet: "bg-blue-100 text-blue-700",
    tag: "bg-blue-50 text-blue-700 border-blue-200",
    number: "text-blue-600",
    icon: "text-blue-600",
  },
  indigo: {
    badge: "bg-indigo-600 text-white",
    border: "border-indigo-200 hover:border-indigo-400",
    bg: "bg-indigo-50",
    bullet: "bg-indigo-100 text-indigo-700",
    tag: "bg-indigo-50 text-indigo-700 border-indigo-200",
    number: "text-indigo-600",
    icon: "text-indigo-600",
  },
  amber: {
    badge: "bg-amber-500 text-white",
    border: "border-amber-200 hover:border-amber-400",
    bg: "bg-amber-50",
    bullet: "bg-amber-100 text-amber-700",
    tag: "bg-amber-50 text-amber-700 border-amber-200",
    number: "text-amber-600",
    icon: "text-amber-600",
  },
};

const techStack = [
  { name: "Next.js 15", desc: "React framework", icon: Globe, color: "bg-black text-white" },
  { name: "React 19", desc: "UI library", icon: Layers, color: "bg-blue-500 text-white" },
  { name: "TypeScript", desc: "Type safety", icon: Code2, color: "bg-blue-700 text-white" },
  { name: "Tailwind CSS", desc: "Styling", icon: Monitor, color: "bg-cyan-500 text-white" },
  { name: "Supabase", desc: "Backend & DB", icon: Database, color: "bg-emerald-600 text-white" },
  { name: "PostgreSQL", desc: "Database", icon: Server, color: "bg-slate-700 text-white" },
  { name: "Paystack", desc: "Payments GH", icon: CreditCard, color: "bg-blue-600 text-white" },
  { name: "Moolre", desc: "Fintech API", icon: CreditCard, color: "bg-purple-600 text-white" },
  { name: "Framer Motion", desc: "Animations", icon: Zap, color: "bg-pink-600 text-white" },
  { name: "Vercel", desc: "Deployment", icon: Globe, color: "bg-slate-900 text-white" },
  { name: "Git & GitHub", desc: "Version control", icon: Code2, color: "bg-orange-600 text-white" },
  { name: "Resend", desc: "Email API", icon: Megaphone, color: "bg-indigo-600 text-white" },
];

const programFeatures = [
  { icon: Clock, label: "4 Weeks Intensive", sub: "Hybrid weekly schedule" },
  { icon: Users, label: "Max 10 Students", sub: "Elite, personalized mentorship" },
  { icon: Award, label: "Professional Diploma", sub: "Doctor Barns Tech award" },
  { icon: GraduationCap, label: "Internship Included", sub: "1-month at DBT" },
  { icon: Calendar, label: "Starts October 19", sub: "2026 cohort" },
  { icon: Download, label: "All Materials Included", sub: "Code, resources & templates" },
];

export default function CurriculumPage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-hidden">

      {/* ─── PAGE HERO ─── */}
      <section className="relative pt-32 pb-20 bg-[#0a192f] overflow-hidden">
        <div className="absolute inset-0 grid-overlay-dark opacity-40" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />

        <Container className="relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="max-w-3xl"
          >
            <motion.span variants={FADE_UP} className="eyebrow text-blue-400 mb-4 block">
              The 4-Week Curriculum
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              No Padding. No Filler.{" "}
              <br className="hidden sm:block" />
              <span className="text-blue-400">Only High-Value Skills.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-slate-400 text-xl leading-relaxed max-w-2xl mb-8">
              Four weeks of relentless, structured immersion. Every topic chosen because it earns money.
              Every project built for a real-world portfolio. Every week ending with you knowing how to
              build something a client will pay for.
            </motion.p>

            {/* Program summary chips */}
            <motion.div variants={FADE_UP} className="flex flex-wrap gap-3">
              {programFeatures.map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl backdrop-blur-sm">
                  <f.icon className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-white text-xs font-bold">{f.label}</p>
                    <p className="text-slate-400 text-[10px]">{f.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ─── WEEK-BY-WEEK BREAKDOWN ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">Week by Week</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Every Week Is Designed to Build On the Last
            </motion.h2>
          </motion.div>

          <div className="space-y-8">
            {curriculum.map((week, i) => {
              const Icon = weekIcons[i];
              const colors = weekColors[week.color];
              return (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={`rounded-3xl border-2 ${colors.border} overflow-hidden transition-all bg-white hover:shadow-lg`}
                >
                  {/* Week Header */}
                  <div className={`${colors.bg} px-8 py-6 flex items-center justify-between flex-wrap gap-4 border-b ${colors.border}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${colors.badge} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className={`text-[11px] font-black uppercase tracking-widest ${colors.number} mb-0.5`}>
                          Week {week.week}
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{week.title}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">{week.subtitle}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${colors.tag}`}>
                      {week.week === 6 ? "🎯 Client Acquisition" : "🛠 Build Week"}
                    </div>
                  </div>

                  {/* Topics + Project */}
                  <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Topics */}
                    <div>
                      <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className={`w-1.5 h-5 rounded-full ${colors.badge.split(" ")[0]}`} />
                        Topics Covered
                      </h4>
                      <ul className="space-y-3">
                        {week.topics.map((topic, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${colors.icon}`} />
                            <span className="text-slate-600 text-sm leading-relaxed">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Project + Outcome */}
                    <div className="space-y-5">
                      <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
                        <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <Layers className={`w-4 h-4 ${colors.icon}`} />
                          Week {week.week} Project
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{week.project}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                        <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          What You&apos;ll Be Able to Do
                        </h4>
                        <p className="text-emerald-700 text-sm leading-relaxed">{week.outcome}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="py-20 sm:py-28 bg-[#0a192f]">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow text-blue-400 mb-3 block">The Tech Stack</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
              Industry-Standard Tools. Zero Outdated Fluff.
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-slate-400 text-base leading-relaxed">
              Every technology in the curriculum is in active production use at top SaaS companies worldwide.
              You will graduate knowing the exact stack startups and agencies are hiring for right now.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={FADE_UP}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/50 hover:bg-white/8 transition-all group text-center"
              >
                <div className={`w-10 h-10 rounded-xl ${tech.color} flex items-center justify-center mx-auto mb-3`}>
                  <tech.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{tech.name}</h3>
                <p className="text-slate-500 text-xs">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── PROGRAM STRUCTURE ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.span variants={FADE_UP} className="eyebrow mb-4 block">Program Structure</motion.span>
              <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
                How the 4 Weeks Are Structured
              </motion.h2>
              <motion.div variants={FADE_UP} className="space-y-5 text-slate-600 text-base leading-relaxed">
                <p>
                  Remote Work Hub runs in a hybrid format with one onsite meeting in Accra and two
                  online meetings every week. This balance keeps accountability high while giving
                  students flexible follow-through between sessions.
                </p>
                <p>
                  Each week follows a structured rhythm: new concepts introduced Monday, deep-dive sessions
                  Tuesday through Friday, and a full project build-out on Saturday with peer review.
                  Every week ends with a working product added to your portfolio.
                </p>
                <p>
                  Week 6 shifts entirely into client acquisition mode. You learn business development,
                  contract writing, client psychology, and execute the 100K Challenge — live, with real
                  prospects, before the program ends.
                </p>
              </motion.div>

              <motion.div variants={FADE_UP} className="mt-8 space-y-3">
                {[
                  { label: "Weekly Structure", value: "1 onsite + 2 online meetings" },
                  { label: "Location", value: "111 Newtown RD, Accra Newtown" },
                  { label: "Cohort Start", value: brand.cohort.startDate },
                  { label: "Program End", value: "November 15, 2026 (approx.)" },
                  { label: "Internship", value: "November 2026 — 1 Month" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-600 text-sm font-medium">{item.label}</span>
                    <span className="text-slate-900 text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.h3 variants={FADE_UP} className="text-xl font-extrabold text-slate-900 mb-6">
                What You Walk Away With
              </motion.h3>
              <motion.div variants={FADE_UP} className="space-y-4">
                {[
                  {
                    num: "01",
                    title: "Diploma in Web Development",
                    desc: "A Doctor Barns Tech-issued Professional Diploma recognized in the industry.",
                    color: "bg-blue-50 border-blue-200",
                    numColor: "text-blue-600",
                  },
                  {
                    num: "02",
                    title: "A Portfolio of Real Systems",
                    desc: "6 production-grade projects across corporate, e-commerce, and enterprise categories.",
                    color: "bg-blue-50 border-blue-200",
                    numColor: "text-blue-600",
                  },
                  {
                    num: "03",
                    title: "Your First Paying Client",
                    desc: "A real, signed web development contract secured before you leave.",
                    color: "bg-emerald-50 border-emerald-200",
                    numColor: "text-emerald-600",
                  },
                  {
                    num: "04",
                    title: "1-Month Internship",
                    desc: "Hands-on experience on live client projects at Doctor Barns Tech.",
                    color: "bg-blue-50 border-blue-200",
                    numColor: "text-blue-600",
                  },
                  {
                    num: "05",
                    title: "RWH Alumni Network Access",
                    desc: "Lifetime access to a growing network of professional developers, clients & opportunities.",
                    color: "bg-slate-50 border-slate-200",
                    numColor: "text-slate-600",
                  },
                  {
                    num: "06",
                    title: "Full-Time Job Opportunity",
                    desc: "Top 2 graduates receive a job offer from Doctor Barns Tech.",
                    color: "bg-amber-50 border-amber-200",
                    numColor: "text-amber-600",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.num}
                    variants={FADE_UP}
                    className={`rounded-xl border p-5 ${item.color} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`text-3xl font-black ${item.numColor} shrink-0 leading-none`}>{item.num}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ─── TUITION & ENROLL ─── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <Container narrow>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#0a192f] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 grid-overlay-dark opacity-40" />
            <div className="relative z-10">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold tracking-widest uppercase mb-6">
                Enroll for October 2026
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Program Fee: <span className="text-amber-400">{brand.cohort.fee}</span>
              </h2>
              <p className="text-slate-400 text-base mb-10 max-w-xl mx-auto leading-relaxed">
                An all-inclusive investment — training, certification, internship placement, and the 100K Challenge.
                Payment plans available. Installments accepted. WhatsApp us to arrange.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply" className="inline-flex items-center gap-2 h-14 px-10 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 transition-all shadow-lg group">
                  Apply Now — Secure Your Seat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/faq" className="inline-flex items-center gap-2 h-14 px-8 bg-white/10 border border-white/10 text-white font-medium text-sm rounded-xl hover:bg-white/15 transition-all">
                  Have Questions? See FAQ
                </Link>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}
