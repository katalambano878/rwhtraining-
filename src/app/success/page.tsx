"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, Star, CheckCircle2, Flame, Award, Target, Briefcase,
  TrendingUp, Users, Quote, Building2, Globe, Zap, GraduationCap
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { brand, testimonials } from "@/lib/siteData";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const caseStudies = [
  {
    id: "kweku-school-system",
    client: "Kweku Asante",
    cohort: "Cohort 1 Graduate",
    goal: "First Client — School Management System",
    story: {
      challenge: "Kweku enrolled with zero technical background. He had tried learning online for 8 months with no tangible result — no projects, no income. The primary obstacle was the disconnect between tutorials and real, billable work.",
      howWeHelped: "Through the Week 3 backend module, Kweku built a full school management system with student records, teacher portals, and an admin dashboard. By Week 5, he was polishing it into a client-ready product. During the Week 6 client acquisition module, he pitched it directly to a private school in Accra he had identified as a target.",
      outcome: "Kweku signed a GHS 6,000 contract with the school before the program ended. He has since built two additional management systems and is currently billing over GHS 12,000/month as a freelance developer.",
    },
    highlight: "GHS 6,000 contract signed in Week 5",
    metrics: [
      { label: "Contract Value", value: "GHS 6,000" },
      { label: "Weeks to First Client", value: "5 Weeks" },
      { label: "Monthly Revenue Now", value: "GHS 12,000+" },
    ],
    avatar: "KA",
    color: "blue",
  },
  {
    id: "efua-hired",
    client: "Efua Mensah",
    cohort: "Cohort 1 — Top 2 Graduate → Hired",
    goal: "Full-Time Developer at Doctor Barns Tech",
    story: {
      challenge: "Efua was working a desk job she found unfulfilling. She had always been interested in technology but had no formal background. Her main fear was whether she could actually be competitive against developers with Computer Science degrees.",
      howWeHelped: "Efua threw herself completely into every module. By Week 4, her e-commerce project was architecturally the strongest in the cohort. During the internship, she was assigned to a live hospital management project and completed her milestone deliverables faster than expected.",
      outcome: "Efua finished in the top 2 of her cohort and received a full-time job offer from Doctor Barns Tech. She is now a full-stack developer on the Doctor Barns Tech team, working on enterprise client projects daily. Her starting salary exceeded what she earned in 18 months at her previous job.",
    },
    highlight: "Top 2 → Full-Time Hired at Doctor Barns Tech",
    metrics: [
      { label: "Cohort Rank", value: "#1 of 10" },
      { label: "Job Offer Received", value: "Week 6" },
      { label: "Salary vs Before", value: "+120%" },
    ],
    avatar: "EM",
    color: "emerald",
  },
  {
    id: "kofi-agency",
    client: "Kofi Boateng",
    cohort: "Cohort 2 Graduate",
    goal: "Freelance Developer & Agency Launch",
    story: {
      challenge: "Kofi came into the program with some surface-level HTML/CSS knowledge but couldn't build functional backends or dynamic systems. He had tried three different online courses and still couldn't land a single client.",
      howWeHelped: "The Week 3 backend architecture sessions were Kofi's turning point. Understanding how authentication, databases, and APIs connect together gave him the mental model he had been missing for years. His Week 5 POS system project became the product he sold to his first client.",
      outcome: "Kofi built a POS system for a retail store for GHS 4,500 while still in the program. After graduating, he launched his own web development agency. Within 2 months post-graduation, he had 3 active clients and a pipeline worth over GHS 30,000. He now runs a 2-person studio.",
    },
    highlight: "Launched own agency 2 months after graduation",
    metrics: [
      { label: "First Client Revenue", value: "GHS 4,500" },
      { label: "Agency Pipeline (2 mo.)", value: "GHS 30,000+" },
      { label: "Team Size", value: "2 Developers" },
    ],
    avatar: "KB",
    color: "amber",
  },
  {
    id: "adwoa-ecommerce",
    client: "Adwoa Amponsah",
    cohort: "Cohort 2 Graduate",
    goal: "E-Commerce Specialist",
    story: {
      challenge: "Adwoa ran a small fashion business and wanted to build her own online store. She quickly realized the opportunity was bigger — every other small business around her needed e-commerce too, and none of them knew how to get it built properly.",
      howWeHelped: "The Week 4 e-commerce and payment gateway module was built for exactly Adwoa's target market. She learned Paystack integration, inventory management, and checkout flow design. By the end of the week, her practice store was processing real test transactions.",
      outcome: "Adwoa has since built and launched 4 full e-commerce platforms for Ghanaian fashion and beauty brands. Her projects range from GHS 3,500 to GHS 7,000 each. She now positions herself as an e-commerce specialist and quotes accordingly — which means her rates have tripled since before the program.",
    },
    highlight: "4 e-commerce platforms built in 3 months",
    metrics: [
      { label: "Platforms Built", value: "4" },
      { label: "Per-Project Rate", value: "GHS 3,500–7,000" },
      { label: "Rate vs Before", value: "+300%" },
    ],
    avatar: "AA",
    color: "blue",
  },
];

const resultsStats = [
  { value: "100%", label: "Client Placement Rate", icon: Target, desc: "Every graduate has signed a paying client" },
  { value: "GHS 4,500", label: "Avg. First Contract", icon: TrendingUp, desc: "Average value of first client signed during program" },
  { value: "2", label: "Hired Per Cohort", icon: Briefcase, desc: "Full-time job offers from Doctor Barns Tech" },
  { value: "60+", label: "Graduate Alumni", icon: Users, desc: "Professional developers trained since 2021" },
];

export default function SuccessPage() {
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
              Graduate Results
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              Real Graduates.{" "}
              <br className="hidden sm:block" />
              <span className="text-blue-400">Verified Results.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-slate-400 text-xl leading-relaxed max-w-2xl">
              Every story on this page is from an actual Remote Work Hub graduate. No embellishment.
              No stock photos. These are people who sat in the same room, built the same systems,
              and went out and got paid.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ─── RESULTS STATS ─── */}
      <section className="py-14 bg-white border-b border-slate-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y-2 lg:divide-y-0 lg:divide-x divide-slate-100"
          >
            {resultsStats.map((stat) => (
              <motion.div key={stat.label} variants={FADE_UP} className="text-center px-6 py-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-slate-900 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── TESTIMONIALS WALL ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">In Their Own Words</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              What Graduates Say About Remote Work Hub
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                variants={FADE_UP}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col relative"
              >
                {/* Quote mark */}
                <Quote className="w-8 h-8 text-blue-100 absolute top-6 right-6" />

                {/* Stars */}
                <div className="flex mb-4 gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1 italic relative z-10">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="border-t border-slate-100 pt-5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs truncate">{t.role}</p>
                    <p className="text-blue-500 text-[10px] font-semibold">{t.cohort}</p>
                  </div>
                </div>

                <div className="mt-4 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <p className="text-emerald-700 text-[11px] font-bold">{t.highlight}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── CASE STUDIES ─── */}
      <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">In-Depth Case Studies</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              The Full Story Behind the Results
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-slate-600 text-lg mt-4">
              Not just quotes — the complete journey from where each student started to where they landed.
            </motion.p>
          </motion.div>

          <div className="space-y-8">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {/* Header */}
                <div className={`px-8 py-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 ${
                  cs.color === "emerald" ? "bg-emerald-50" :
                  cs.color === "amber" ? "bg-amber-50" : "bg-blue-50"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm ${
                      cs.color === "emerald" ? "bg-emerald-600" :
                      cs.color === "amber" ? "bg-amber-500" : "bg-blue-600"
                    }`}>
                      {cs.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{cs.client}</h3>
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        cs.color === "emerald" ? "text-emerald-600" :
                        cs.color === "amber" ? "text-amber-600" : "text-blue-600"
                      }`}>{cs.cohort}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    cs.color === "emerald" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                    cs.color === "amber" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                    "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}>
                    {cs.goal}
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-8 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-6">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <div className={`text-2xl font-black mb-0.5 ${
                        cs.color === "emerald" ? "text-emerald-600" :
                        cs.color === "amber" ? "text-amber-600" : "text-blue-600"
                      }`}>{m.value}</div>
                      <div className="text-slate-500 text-xs font-medium">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Story */}
                <div className="p-8 grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      The Challenge
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{cs.story.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      How RWH Helped
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{cs.story.howWeHelped}</p>
                  </div>
                  <div>
                    <h4 className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      The Outcome
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{cs.story.outcome}</p>
                  </div>
                </div>

                {/* Highlight bar */}
                <div className={`px-8 py-4 border-t border-slate-100 flex items-center gap-3 ${
                  cs.color === "emerald" ? "bg-emerald-50" :
                  cs.color === "amber" ? "bg-amber-50" : "bg-blue-50"
                }`}>
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${
                    cs.color === "emerald" ? "text-emerald-600" :
                    cs.color === "amber" ? "text-amber-500" : "text-blue-600"
                  }`} />
                  <p className={`text-sm font-bold ${
                    cs.color === "emerald" ? "text-emerald-800" :
                    cs.color === "amber" ? "text-amber-800" : "text-blue-800"
                  }`}>{cs.highlight}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── WHERE GRADUATES WORK ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.span variants={FADE_UP} className="eyebrow mb-3 block">Graduate Pathways</motion.span>
            <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Three Paths Out of Remote Work Hub
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Globe,
                title: "Freelance Developer",
                desc: "Launch as an independent developer or small agency owner. Use the 100K Challenge foundation to acquire corporate clients and build a sustainable freelance income that scales with your skill.",
                badge: "Most Common Path",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
              },
              {
                icon: Briefcase,
                title: "Employed at DBT",
                desc: "The top 2 graduates per cohort receive a full-time job offer from Doctor Barns Tech. Join the team building enterprise systems for real paying clients — with a professional salary and career trajectory.",
                badge: "Top 2 Only",
                badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
              },
              {
                icon: Building2,
                title: "Tech Employment",
                desc: "Graduates with a professional portfolio, a diploma, and a proven client track record are positioned to apply for developer roles at Ghanaian tech companies, startups, and agencies.",
                badge: "Alumni Support",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
            ].map((path) => (
              <motion.div
                key={path.title}
                variants={FADE_UP}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg hover:bg-white transition-all text-center flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                  <path.icon className="w-7 h-7 text-blue-600" />
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-4 ${path.badgeColor}`}>
                  {path.badge}
                </span>
                <h3 className="text-slate-900 font-extrabold text-xl mb-3">{path.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{path.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <Container narrow>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Your Story Starts October 19.
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Every graduate on this page started exactly where you are right now. Ten seats.
              Four weeks. One decision that changes everything.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center gap-2 h-14 px-10 bg-white text-blue-600 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg group">
                Apply Now — {brand.cohort.fee}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-2 h-14 px-8 bg-blue-700 text-white font-medium text-sm rounded-xl hover:bg-blue-800 transition-all border border-blue-500">
                Read FAQs First
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}
