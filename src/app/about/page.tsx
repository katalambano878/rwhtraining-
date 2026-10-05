"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Flame, Award, Code2, Users, Globe,
  Target, Briefcase, Building2, Star, ShieldCheck, Zap, Terminal,
  GraduationCap, TrendingUp, Heart
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { brand, instructorProfile, stats } from "@/lib/siteData";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const values = [
  {
    icon: Target,
    title: "Results Over Theory",
    desc: "Every module, exercise, and project is designed with one question: will this get students paid? If it doesn't move the needle on real income, it doesn't make the curriculum.",
    color: "blue",
  },
  {
    icon: ShieldCheck,
    title: "Radical Accountability",
    desc: "No excuses. No shortcuts. Students who enroll make a commitment to show up, build, and deliver. We hold that standard — and we expect the same in return.",
    color: "blue",
  },
  {
    icon: Heart,
    title: "Genuine Investment in Students",
    desc: "We celebrate every client contract, every deployment, every breakthrough moment. Your success is Doctor Barns Tech's success. It's not transactional — it's a partnership.",
    color: "amber",
  },
  {
    icon: TrendingUp,
    title: "Industry-Current Standards",
    desc: "The stack we teach is the same stack powering top SaaS companies globally — Next.js, TypeScript, Supabase, Tailwind. Not yesterday's tools. The real thing.",
    color: "emerald",
  },
];

const milestones = [
  { year: "2019", title: "Doctor Barns Tech Founded", desc: "Started as a one-person web development agency serving Accra businesses with enterprise-grade systems." },
  { year: "2021", title: "First Cohort Launched", desc: "Ran the first Remote Work Hub masterclass with 6 students. 100% landed a paying client within the program." },
  { year: "2022", title: "Cohort 2 — Top 2 Hired", desc: "Introduced the hiring program. Two graduates joined Doctor Barns Tech full-time after demonstrating outstanding performance." },
  { year: "2023", title: "Alumni Network Established", desc: "100+ graduates connected across a professional network spanning freelance, agencies, and tech employment." },
  { year: "2024", title: "Enterprise Client Growth", desc: "Doctor Barns Tech systems deployed at schools, hospitals, hotels, and corporations across Ghana." },
  { year: "2026", title: "Next Evolution — October 19", desc: "A refined, 4-week intensive curriculum. GHS 1,000 promotional price. 10 seats. The most focused, practical edition of Remote Work Hub yet." },
];

const doctorBarnsCredentials = [
  "10+ years professional software engineering experience",
  "Founder of Doctor Barns Tech — a full-service agency",
  "Built systems for schools, hospitals, hotels & corporations",
  "Expert in Next.js 15, TypeScript, Supabase & SaaS architecture",
  "Trained developers now working across Ghana's tech sector",
  "Architect of Ghana's most practical coding bootcamp model",
];

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-hidden">

      {/* ─── PAGE HERO ─── */}
      <section className="relative pt-32 pb-20 bg-[#0a192f] overflow-hidden">
        <div className="absolute inset-0 grid-overlay-dark opacity-40" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />

        <Container className="relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER}
            className="max-w-3xl"
          >
            <motion.span variants={FADE_UP} className="eyebrow text-blue-400 mb-4 block">
              About Remote Work Hub
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              We Don&apos;t Train Students.{" "}
              <br className="hidden sm:block" />
              <span className="text-blue-400">We Build Engineers.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-slate-400 text-xl leading-relaxed max-w-2xl">
              Remote Work Hub is Ghana&apos;s most intensive offline web development masterclass.
              We exist to bridge the gap between someone who wants to code and someone who gets
              paid to build enterprise systems.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ─── MISSION STATEMENT ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.span variants={FADE_UP} className="eyebrow mb-4 block">Our Mission</motion.span>
              <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
                Close the Gap Between Learning and Earning.
              </motion.h2>
              <motion.div variants={FADE_UP} className="space-y-5 text-slate-600 text-base leading-relaxed">
                <p>
                  Ghana has thousands of young people who want to build a career in technology.
                  But the path between &ldquo;I want to code&rdquo; and &ldquo;I am getting paid to build systems&rdquo;
                  is brutally unclear. YouTube tutorials, free online courses, and bootcamps that teach
                  outdated tools are flooding the market with developers who can&apos;t deliver on real projects.
                </p>
                <p>
                  <strong className="text-slate-900">Remote Work Hub exists to eliminate that gap entirely.</strong>{" "}
                  We built a curriculum around what clients actually pay for — complex, production-grade systems —
                  and we teach it offline, in person, with relentless mentorship and zero tolerance for mediocrity.
                </p>
                <p>
                  Every graduate leaves with a paid client, a professional portfolio, a diploma, and a 1-month
                  internship at Doctor Barns Tech. The two best-performing students get hired full-time.
                  That is the standard we hold ourselves to.
                </p>
              </motion.div>
              <motion.div variants={FADE_UP} className="mt-8">
                <Link href="/curriculum" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all group">
                  View Full Curriculum
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
              className="grid grid-cols-2 gap-5"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={FADE_UP}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-7 text-center hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="text-4xl font-black text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-900 mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ─── MEET THE INSTRUCTOR ─── */}
      <section className="py-20 sm:py-28 bg-[#0a192f] text-white overflow-hidden relative">
        <div className="absolute inset-0 grid-overlay-dark opacity-40" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image placeholder / decorative block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-blue-600/10 rounded-[2.5rem] transform -rotate-2" />
              <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  {/* Avatar badge */}
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white mb-6">
                    DB
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{instructorProfile.name}</h3>
                  <p className="text-blue-400 text-sm font-semibold mb-6">{instructorProfile.title}</p>

                  <div className="space-y-3 mb-8">
                    {doctorBarnsCredentials.map((cred, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm leading-relaxed">{cred}</span>
                      </div>
                    ))}
                  </div>

                  {/* Philosophy quote */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      &ldquo;{instructorProfile.philosophy}&rdquo;
                    </p>
                    <p className="text-blue-400 text-xs font-bold mt-3">— {instructorProfile.name}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.span variants={FADE_UP} className="eyebrow text-blue-400 mb-4 block">
                Your Instructor
              </motion.span>
              <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Trained by a Developer Who Has{" "}
                <span className="text-blue-400">Done the Work.</span>
              </motion.h2>
              <motion.div variants={FADE_UP} className="space-y-5 text-slate-400 text-base leading-relaxed mb-8">
                <p>{instructorProfile.bio}</p>
                <p>
                  Every system in the curriculum is one Dr. Barns has built in production for real paying clients.
                  The school management systems, the hospital portals, the POS systems, the CRMs — they are all
                  based on live software deployed at Ghanaian businesses. You are not learning from theory.
                  You are learning from a working professional.
                </p>
                <p>
                  This philosophy is why Remote Work Hub graduates consistently outperform self-taught developers
                  who have been watching tutorials for years. The curriculum is brutally practical,
                  relentlessly focused, and designed to produce one outcome: your first paid client.
                </p>
              </motion.div>
              <motion.div variants={FADE_UP}>
                <Link href="/apply" className="inline-flex items-center gap-2 h-12 px-8 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all group">
                  Apply for the Next Cohort
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ─── OUR VALUES ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">What We Stand For</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              The Principles Behind Every Decision We Make
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid sm:grid-cols-2 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={FADE_UP}
                className="flex gap-5 p-7 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg bg-slate-50 hover:bg-white transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  v.color === "blue" ? "bg-blue-50" :
                  v.color === "amber" ? "bg-amber-50" : "bg-emerald-50"
                }`}>
                  <v.icon className={`w-6 h-6 ${
                    v.color === "blue" ? "text-blue-600" :
                    v.color === "amber" ? "text-amber-500" : "text-emerald-600"
                  }`} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── TIMELINE / MILESTONES ─── */}
      <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">Our Journey</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              From One-Person Agency to Ghana&apos;s Premier Tech Masterclass
            </motion.h2>
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-8 relative"
                >
                  {/* Node */}
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0 z-10 shadow-[0_0_0_6px_white]">
                    {m.year.slice(2)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">{m.year}</div>
                    <h3 className="text-slate-900 font-bold text-base mb-2">{m.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── DOCTOR BARNS TECH ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.span variants={FADE_UP} className="eyebrow mb-4 block">The Company Behind It</motion.span>
              <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
                Doctor Barns Tech:{" "}
                <span className="text-blue-600">Where Graduates Come to Work.</span>
              </motion.h2>
              <motion.div variants={FADE_UP} className="space-y-5 text-slate-600 text-base leading-relaxed">
                <p>
                  Doctor Barns Tech is the full-service web development agency behind Remote Work Hub.
                  We actively build and deploy enterprise-grade systems for Ghanaian businesses —
                  which is exactly why we know what skills the industry actually needs.
                </p>
                <p>
                  The internship program places every RWH graduate directly into Doctor Barns Tech&apos;s
                  active project pipeline. The top two performers each cohort receive a full-time offer.
                  This isn&apos;t a theoretical pathway — it&apos;s a real company with real clients, offering
                  real employment to the developers we train.
                </p>
              </motion.div>

              <motion.div variants={FADE_UP} className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Active Enterprise Clients", value: "50+" },
                  { label: "Systems Deployed in Ghana", value: "80+" },
                  { label: "Graduates Now Working in Tech", value: "40+" },
                  { label: "Years Building in Ghana", value: "7+" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-blue-600 mb-1">{item.value}</div>
                    <div className="text-xs text-slate-600 font-medium">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
              className="space-y-4"
            >
              <motion.span variants={FADE_UP} className="text-slate-500 text-sm font-semibold uppercase tracking-wider block mb-5">
                Systems We Build for Clients
              </motion.span>
              {[
                { icon: Building2, title: "School & University Management Systems" },
                { icon: Zap, title: "Hospital & Clinic Management Platforms" },
                { icon: Target, title: "Corporate CRM & Sales Pipeline Systems" },
                { icon: Terminal, title: "POS & Inventory Management Software" },
                { icon: Globe, title: "Premium Corporate & E-Commerce Websites" },
                { icon: Users, title: "HR, Payroll & Employee Management Portals" },
                { icon: GraduationCap, title: "NGO & Church Management Systems" },
                { icon: TrendingUp, title: "Accounting, Invoicing & ERP Platforms" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={FADE_UP}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-semibold text-sm">{item.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <Container narrow>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ready to Build Something Real?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Apply for the October 19 cohort. 10 seats. {brand.cohort.fee}. Four weeks that will change your
              career trajectory permanently.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center gap-2 h-14 px-10 bg-white text-blue-600 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg group">
                Apply Now — {brand.cohort.fee}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/curriculum" className="inline-flex items-center gap-2 h-14 px-10 bg-blue-700 text-white font-bold text-base rounded-xl hover:bg-blue-800 transition-all border border-blue-500">
                View Curriculum First
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}
