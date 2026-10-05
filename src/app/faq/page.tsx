"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Plus, Minus, MessageCircle, Phone, HelpCircle,
  BookOpen, CreditCard, Users, Award, Code2, MapPin, Clock
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { brand, faqs } from "@/lib/siteData";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const faqCategories = [
  {
    id: "eligibility",
    label: "Eligibility",
    icon: Users,
    color: "blue",
    indices: [0, 7],
  },
  {
    id: "curriculum",
    label: "Curriculum & Stack",
    icon: Code2,
    color: "indigo",
    indices: [1, 6],
  },
  {
    id: "guarantees",
    label: "Our Guarantees",
    icon: Award,
    color: "emerald",
    indices: [2, 3, 4],
  },
  {
    id: "payment",
    label: "Payment & Fees",
    icon: CreditCard,
    color: "amber",
    indices: [5, 11],
  },
  {
    id: "program",
    label: "Program Details",
    icon: BookOpen,
    color: "blue",
    indices: [7, 8, 9, 10],
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={FADE_UP}
      className={`rounded-2xl border overflow-hidden transition-all ${
        open ? "border-blue-300 shadow-[0_4px_20px_rgba(37,99,235,0.08)]" : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-6 text-left bg-white hover:bg-slate-50/50 transition-colors"
      >
        <span className="flex items-center gap-4 flex-1">
          <span className="text-blue-600 font-black text-xs shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-bold text-slate-900 text-base leading-snug pr-4">{question}</span>
        </span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          open ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 border-t border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed mt-4">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
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
              Frequently Asked Questions
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              Every Question.{" "}
              <br className="hidden sm:block" />
              <span className="text-blue-400">Answered Honestly.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-slate-400 text-xl leading-relaxed max-w-2xl">
              No vague language. No promises we don&apos;t keep. Everything you need to know about
              Remote Work Hub before you apply — laid out plainly.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ─── QUICK FACTS ─── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { icon: Clock, label: "Duration", value: brand.cohort.duration },
              { icon: MapPin, label: "Location", value: "Accra, Ghana" },
              { icon: Users, label: "Class Size", value: "10 Students" },
              { icon: CreditCard, label: "Fee", value: brand.cohort.fee },
              { icon: Award, label: "Award", value: "Professional Diploma" },
              { icon: Code2, label: "Format", value: "Hybrid" },
            ].map((fact) => (
              <motion.div key={fact.label} variants={FADE_UP} className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <fact.icon className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500 mb-1">{fact.label}</div>
                <div className="text-sm font-black text-slate-900">{fact.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── MAIN FAQ LIST ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="grid lg:grid-cols-[260px_1fr] gap-12">

            {/* Sidebar — category nav (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-28 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</p>
                {faqCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                  >
                    <cat.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    {cat.label}
                  </a>
                ))}

                {/* CTA sidebar */}
                <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-blue-800 font-bold text-sm mb-1">Still have questions?</p>
                  <p className="text-blue-600 text-xs mb-4 leading-relaxed">WhatsApp us directly. We reply within the hour.</p>
                  <a
                    href={`https://wa.me/${brand.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full py-2.5 px-4 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors justify-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div>
              {/* All FAQs */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={STAGGER}
                className="space-y-3"
              >
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">All Frequently Asked Questions</h2>
                {faqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
                ))}
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── DIDN'T FIND YOUR ANSWER ─── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={FADE_UP} className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md hover:border-blue-200 transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">WhatsApp Us</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Message us directly on WhatsApp. We&apos;re available Monday to Saturday and typically respond within the hour.
              </p>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </a>
            </motion.div>

            <motion.div variants={FADE_UP} className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md hover:border-blue-200 transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Call Us</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Prefer to speak? Call us directly. We&apos;re available during training hours and will answer any questions you have.
              </p>
              <a
                href={`tel:${brand.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {brand.phone}
              </a>
            </motion.div>

            <motion.div variants={FADE_UP} className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md hover:border-blue-200 transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Use the Contact Form</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                Submit a specific question or request via our contact page. We&apos;ll respond with a detailed answer within 24 hours.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Contact Page
              </Link>
            </motion.div>
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
              Ready to Apply?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              The October 19 cohort fills fast. 10 seats. First come, first confirmed.
            </p>
            <Link href="/apply" className="inline-flex items-center gap-2 h-14 px-10 bg-white text-blue-600 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg group">
              Apply Now — {brand.cohort.fee}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}
