"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, Phone, Mail, MapPin, MessageCircle, Clock,
  CheckCircle2, Send, Globe, Instagram, Facebook, Twitter
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { brand } from "@/lib/siteData";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: brand.phone,
    sub: "Fastest response — usually under 1 hour",
    href: `https://wa.me/${brand.whatsapp}`,
    cta: "Message on WhatsApp",
    color: "bg-green-50 border-green-200 text-green-600",
    btnColor: "bg-green-600 hover:bg-green-700 text-white",
    external: true,
  },
  {
    icon: Phone,
    title: "Phone",
    value: brand.phone,
    sub: "Available Mon–Sat, 8am–6pm",
    href: `tel:${brand.phone.replace(/\s/g, "")}`,
    cta: "Call Now",
    color: "bg-blue-50 border-blue-200 text-blue-600",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    external: false,
  },
  {
    icon: Mail,
    title: "Email",
    value: brand.email,
    sub: "We respond within 24 hours",
    href: `mailto:${brand.email}`,
    cta: "Send Email",
    color: "bg-amber-50 border-amber-200 text-amber-600",
    btnColor: "bg-amber-500 hover:bg-amber-600 text-white",
    external: false,
  },
];

const faqs = [
  { q: "When does the October cohort start?", a: `October 19, 2026. Training runs Mon–Sat, 8am–5pm, for 4 weeks.` },
  { q: "How do I secure my seat?", a: "Apply via the application form. Upon review, we'll reach out to confirm your spot and provide payment details." },
  { q: "Is there a payment plan?", a: `Yes. Contact us on WhatsApp (${brand.phone}) to arrange a deposit and installment structure.` },
  { q: "Where is the training held?", a: `Hybrid format: one onsite session at ${brand.address} plus two online sessions each week.` },
];

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", interest: "Apply for October Cohort" });
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1500));
    setFormState("sent");
  };

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
              Get in Touch
            </motion.span>
            <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
              We&apos;d Love to{" "}
              <br className="hidden sm:block" />
              <span className="text-blue-400">Hear from You.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-slate-400 text-xl leading-relaxed max-w-2xl">
              Questions about the program, payment plans, or anything else — reach out directly.
              We respond fast. No automated bots. A real person every time.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ─── CONTACT METHODS ─── */}
      <section className="py-16 bg-white border-b border-slate-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="grid sm:grid-cols-3 gap-5"
          >
            {contactMethods.map((method) => (
              <motion.div
                key={method.title}
                variants={FADE_UP}
                className={`rounded-2xl border p-7 ${method.color} hover:shadow-md transition-all`}
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <method.icon className={`w-6 h-6 ${method.color.split(" ")[2]}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{method.title}</h3>
                <p className="font-semibold text-slate-700 text-sm mb-1">{method.value}</p>
                <p className="text-slate-500 text-xs mb-5">{method.sub}</p>
                <a
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${method.btnColor}`}
                >
                  {method.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ─── FORM + INFO ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container>
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">

            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.span variants={FADE_UP} className="eyebrow mb-4 block">Send a Message</motion.span>
              <motion.h2 variants={FADE_UP} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8">
                Tell Us How We Can Help
              </motion.h2>

              {formState === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Message Received!</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours. For faster responses,
                    WhatsApp us at <strong>{brand.phone}</strong>.
                  </p>
                  <Link href="/apply" className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Apply for October Cohort
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  variants={FADE_UP}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Name + Email row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Interest */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">What&apos;s your inquiry about? *</label>
                    <select
                      required
                      value={form.interest}
                      onChange={(e) => setForm({ ...form, interest: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option>Apply for October Cohort</option>
                      <option>Payment Plan Inquiry</option>
                      <option>Curriculum Questions</option>
                      <option>Corporate / Group Training</option>
                      <option>General Inquiry</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you'd like to know or how we can help..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="flex items-center gap-2 h-14 px-8 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                  >
                    {formState === "sending" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-slate-400 text-xs">
                    We respond within 24 hours. For urgent inquiries, WhatsApp us at {brand.phone}.
                  </p>
                </motion.form>
              )}
            </motion.div>

            {/* Sidebar Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
              className="space-y-6"
            >
              {/* Location */}
              <motion.div variants={FADE_UP} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Training Location
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{brand.address}</p>
                <div className="mt-4 bg-slate-200 rounded-xl h-40 flex items-center justify-center text-slate-500 text-sm">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p>Accra Newtown, Ghana</p>
                  </div>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div variants={FADE_UP} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Training Hours
                </h3>
                <div className="space-y-2">
                  {[
                    { day: "Monday – Friday", time: "8:00am – 5:00pm" },
                    { day: "Saturday", time: "8:00am – 2:00pm" },
                    { day: "Sunday", time: "Closed" },
                  ].map((item) => (
                    <div key={item.day} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{item.day}</span>
                      <span className={`font-semibold ${item.time === "Closed" ? "text-slate-400" : "text-slate-900"}`}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social */}
              <motion.div variants={FADE_UP} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 text-base mb-4">Follow Us</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Instagram, label: "Instagram", href: brand.social.instagram, handle: "@remoteworkhub" },
                    { icon: Facebook, label: "Facebook", href: brand.social.facebook, handle: "Remote Work Hub" },
                    { icon: Twitter, label: "X (Twitter)", href: brand.social.twitter, handle: "@remoteworkhub" },
                    { icon: Globe, label: "Website", href: brand.website, handle: "remoteworkhub.org" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:border hover:border-slate-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <s.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{s.label}</p>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{s.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Quick FAQs */}
              <motion.div variants={FADE_UP} className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 text-base mb-4">Quick Answers</h3>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.q}>
                      <p className="font-bold text-slate-800 text-xs mb-1">{faq.q}</p>
                      <p className="text-slate-600 text-xs leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
                <Link href="/faq" className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:text-blue-700 transition-colors mt-4">
                  See all FAQs <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ─── WHATSAPP CTA BAND ─── */}
      <section className="py-16 bg-[#0a192f]">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <motion.div variants={FADE_UP} className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                Prefer to talk it through? We&apos;re on WhatsApp.
              </h2>
              <p className="text-slate-400 text-base">
                Message us on WhatsApp and get a real response from the team — not a bot.
              </p>
            </motion.div>
            <motion.div variants={FADE_UP} className="flex items-center gap-4 shrink-0">
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-8 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp: {brand.phone}
              </a>
              <Link href="/apply" className="inline-flex items-center gap-2 h-12 px-8 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all">
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}
