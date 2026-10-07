"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitApplicationAction } from "@/app/actions/submit-application";
import { autosaveApplicationAction } from "@/app/actions/autosave";

export default function ApplyPage() {
    const [step, setStep] = useState(1);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const selectedTier = "100";
    const [paymentMethod, setPaymentMethod] = useState<"moolre" | "paystack">("moolre");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const totalSteps = 4;
    const progressPercent = (step / totalSteps) * 100;

    const handleNext = async () => {
        const currentStepDiv = document.getElementById(`step-${step}`);
        if (currentStepDiv) {
            const invalidFields = currentStepDiv.querySelectorAll(':invalid');
            if (invalidFields.length > 0) {
                const firstInvalid = invalidFields[0] as HTMLInputElement | HTMLTextAreaElement;
                if (firstInvalid && typeof firstInvalid.reportValidity === 'function') {
                    firstInvalid.reportValidity();
                }
                return;
            }
        }

        // Autosave when moving to the next step
        try {
            const form = document.querySelector('form') as HTMLFormElement;
            if (form) {
                const formData = new FormData(form);
                formData.set("tier", selectedTier);
                const res = await autosaveApplicationAction(formData, applicationId || undefined);
                if (res.success && res.id) {
                    setApplicationId(res.id);
                }
            }
        } catch (error) {
            console.error("Autosave failed:", error);
        }

        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            // Append the selected tier since RadioGroup doesn't natively serialize
            formData.set("tier", selectedTier);
            formData.set("paymentMethod", paymentMethod);
            if (applicationId) {
                formData.set("applicationId", applicationId);
            }

            const res = await submitApplicationAction(formData);

            if (res.success && res.redirect_url) {
                window.location.href = res.redirect_url;
            } else {
                alert(`Error: ${res.error || "Something went wrong sending your application. Please try again."}`);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("A critical network error occurred. Please check your connection and try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">

            {/* Left Banner Info (Always visible on md/lg) */}
            <div className="hidden md:flex md:w-[40%] lg:w-[35%] border-r border-slate-200 bg-white flex-col justify-between p-12 lg:p-14 relative overflow-hidden group">
                {/* Hero 3 Backing */}
                <div
                    className="absolute inset-0 bg-[url('/hero3.jpeg')] bg-cover bg-center opacity-[0.05] group-hover:scale-105 transition-transform duration-[20s] ease-out pointer-events-none"
                    style={{ filter: "grayscale(80%) sepia(20%) hue-rotate(5deg)" }}
                />

                {/* Premium Gradated Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/90 to-white pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

                <div className="relative z-10 isolate flex flex-col h-full">
                    <div>
                        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 font-semibold text-xs uppercase tracking-widest transition-colors mb-16 group/link">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover/link:-translate-x-1.5 transition-transform" />
                            Back to Masterclass
                        </Link>

                        <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
                            Extreme <br className="hidden lg:block" />Engineering.
                        </h1>
                        <p className="text-slate-600 leading-relaxed mb-12 text-[15px] max-w-sm">
                            This application acts as your first technical commit. We filter strictly for ambition and the drive to command top-tier scalable software.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start group/feature p-5 -ml-5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                <div className="p-2.5 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl shrink-0 group-hover/feature:border-[#2563EB]/40 group-hover/feature:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all">
                                    <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <div>
                                    <strong className="block text-slate-900 mb-1 font-bold text-sm tracking-wider uppercase">Strict Quality Control</strong>
                                    <span className="text-slate-600 font-medium text-sm leading-relaxed block pr-4">Only 10 slots maximum per cohort. Ensuring pure, high-fidelity technical mentoring.</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group/feature p-5 -ml-5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                <div className="p-2.5 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-xl shrink-0 group-hover/feature:border-[#2563EB]/40 group-hover/feature:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all">
                                    <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <div>
                                    <strong className="block text-slate-900 mb-1 font-bold text-sm tracking-wider uppercase">Zero-Theory Driven</strong>
                                    <span className="text-slate-600 font-medium text-sm leading-relaxed block pr-4">No padded content. You assemble and launch production-grade infrastructure immediately.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 flex items-end justify-between border-t border-slate-200">
                        <span className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">© 2026 Remote Work Hub</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                            <span className="text-[10px] text-[#2563EB] tracking-widest uppercase font-bold">Secure Portal</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Area */}
            <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col min-h-screen">

                {/* Mobile Header Elements */}
                <div className="md:hidden p-4 sm:p-6 border-b border-slate-200 bg-white">
                    <Link href="/" className="inline-flex items-center text-slate-500 font-medium text-sm mb-3 tracking-wide">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Return
                    </Link>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">Application Portal</h2>
                </div>

                {/* Progress Bar & Frame Container */}
                <div className="flex-grow flex flex-col justify-center max-w-2xl px-4 sm:px-8 py-8 sm:py-12 mx-auto w-full relative">

                    <div className="mb-14 relative">
                        <div className="flex items-end justify-between mb-5">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-pulse" />
                                    Phase {step} <span className="text-slate-300 px-1">/</span> {totalSteps}
                                </span>
                                <span className="text-slate-900 font-serif text-lg tracking-wide hidden sm:block">
                                    {step === 1 && "Personal Details"}
                                    {step === 2 && "Profile & Background"}
                                    {step === 3 && "Motivation & Commitment"}
                                    {step === 4 && "Pay in Full"}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#2563EB] tracking-[0.2em]">
                                {step === 1 && "INITIATION"}
                                {step === 2 && "ANALYSIS"}
                                {step === 3 && "COMMITMENT"}
                                {step === 4 && "SECURE SLOT"}
                            </span>
                        </div>

                        {/* God-level progress timeline */}
                        <div className="relative w-full h-[1px] bg-slate-200 rounded-full overflow-visible">
                            {/* Glowing active bar */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-gradient-to-r from-[#2563EB]/40 to-[#2563EB] transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px]">

                        {/* Step 1: Basics */}
                        <div id="step-1" className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 1 ? 'block' : 'hidden'}`}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-3 tracking-tight text-slate-900">Who are you?</h2>
                                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">Basic identification to secure your position in the upcoming cohort.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3 relative group">
                                    <Label htmlFor="firstName" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">First Name</Label>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                    <Input id="firstName" name="firstName" placeholder="Kwame" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                                </div>
                                <div className="space-y-3 relative group">
                                    <Label htmlFor="lastName" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">Last Name</Label>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                    <Input id="lastName" name="lastName" placeholder="Mensah" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                                </div>
                            </div>

                            <div className="space-y-3 relative group">
                                <Label htmlFor="email" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">Email Address</Label>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                <Input id="email" name="email" type="email" placeholder="k.mensah@example.com" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3 relative group">
                                    <Label htmlFor="phone" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">WhatsApp Number</Label>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                    <Input id="phone" name="phone" type="tel" placeholder="+233 5X XXX XXXX" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                                </div>
                                <div className="space-y-3 relative group">
                                    <Label htmlFor="age" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">Age</Label>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                    <Input id="age" name="age" type="number" min="14" max="99" placeholder="e.g. 24" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                                </div>
                            </div>

                            <div className="space-y-3 relative group">
                                <Label htmlFor="city" className="text-slate-500 font-bold uppercase tracking-widest text-xs transition-colors group-focus-within:text-[#2563EB]">City / Location</Label>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                <Input id="city" name="city" placeholder="e.g. Accra, Ghana" className="relative z-10 h-14 bg-white border-slate-200 rounded-2xl px-5 text-base focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all" required />
                            </div>
                        </div>

                        {/* Step 2: Background */}
                        <div id="step-2" className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 2 ? 'block' : 'hidden'}`}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-3 tracking-tight text-slate-900">Your Background.</h2>
                                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">We accept absolute beginners, but we strictly require professionals with a high action threshold.</p>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[#2563EB] font-bold uppercase tracking-widest text-xs">Current Occupation</Label>
                                <RadioGroup defaultValue="student" className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" name="occupation">
                                    {['Student', 'Recent Graduate', 'Employed Professional', 'Freelancer/Entrepreneur'].map((opt) => (
                                        <div key={opt} className="relative group">
                                            <div className="absolute inset-0 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
                                            <div className="flex items-center space-x-3 border border-slate-200 bg-white rounded-2xl p-5 hover:border-[#2563EB]/40 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm relative z-10">
                                                <RadioGroupItem value={opt.toLowerCase()} id={`occ-${opt}`} className="border-slate-300 text-[#2563EB] data-[state=checked]:border-[#2563EB]" />
                                                <Label htmlFor={`occ-${opt}`} className="text-slate-900 font-medium cursor-pointer flex-1">{opt}</Label>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Label className="text-[#2563EB] font-bold uppercase tracking-widest text-xs">Prior Coding Experience Level</Label>
                                <RadioGroup defaultValue="none" className="grid gap-4 pt-2" name="experience">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
                                        <div className="flex items-center space-x-4 border border-slate-200 bg-white rounded-2xl p-6 hover:border-[#2563EB]/40 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm relative z-10">
                                            <RadioGroupItem value="none" id="exp-1" className="border-slate-300 mt-0.5 text-[#2563EB] data-[state=checked]:border-[#2563EB]" />
                                            <Label htmlFor="exp-1" className="cursor-pointer flex-1">
                                                <span className="block font-bold text-slate-900 mb-1.5 text-[15px]">Absolute Beginner</span>
                                                <span className="text-slate-600 font-medium text-sm leading-relaxed block">I have never written a line of code. Ready to start from point zero.</span>
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-[#2563EB]/5 blur-[20px] opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
                                        <div className="flex items-center space-x-4 border border-slate-200 bg-white rounded-2xl p-6 hover:border-[#2563EB]/40 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm relative z-10">
                                            <RadioGroupItem value="some" id="exp-2" className="border-slate-300 mt-0.5 text-[#2563EB] data-[state=checked]:border-[#2563EB]" />
                                            <Label htmlFor="exp-2" className="cursor-pointer flex-1">
                                                <span className="block font-bold text-slate-900 mb-1.5 text-[15px]">Know Some Basics</span>
                                                <span className="text-slate-600 font-medium text-sm leading-relaxed block">I've watched tutorials or know basic HTML/CSS. Ready to build full-scale apps.</span>
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="pt-6">
                                <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-200 bg-blue-50 hover:border-blue-300 transition-all duration-500 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 p-0 h-full bg-[#2563EB]/50 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom" />
                                    <Checkbox id="laptop" name="laptop" className="mt-1 w-5 h-5 border-blue-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB] data-[state=checked]:text-white shrink-0 transition-colors" required />
                                    <div className="space-y-1.5 pt-0.5 w-full">
                                        <Label htmlFor="laptop" className="cursor-pointer text-[15px] font-bold text-[#2563EB] block">Hardware & Internet Requirement</Label>
                                        <Label htmlFor="laptop" className="cursor-pointer text-sm text-blue-700 leading-relaxed font-medium block">I confirm that I have access to a reliable, working laptop and an internet connection to participate in this cohort.</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Motivation */}
                        <div id="step-3" className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 3 ? 'block' : 'hidden'}`}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-3 tracking-tight text-slate-900">Your Drive.</h2>
                                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">We don't do theoretical padding. Prove your ambition to claim a seat.</p>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="reason" className="text-[#2563EB] font-bold uppercase tracking-widest text-xs">Why you over thousands of others?</Label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#2563EB]/10 blur-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-2xl" />
                                    <Textarea id="reason" name="reason" placeholder="I am tired of basic tutorials. I want to engineer production-ready apps..." className="relative min-h-[180px] bg-white border-slate-200 rounded-2xl p-6 text-[15px] focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/20 resize-none leading-relaxed text-slate-900 placeholder:text-slate-400 transition-all z-10 shadow-sm" required />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6">
                                {/* Commit Card */}
                                <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-500 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 p-0 h-full bg-[#2563EB]/30 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom" />
                                    <Checkbox id="commit" name="commit" className="mt-1 w-5 h-5 border-slate-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB] data-[state=checked]:text-white shrink-0 transition-colors" required />
                                    <div className="space-y-1.5 pt-0.5 w-full">
                                        <Label htmlFor="commit" className="cursor-pointer text-[15px] font-bold text-slate-900 block">Savage Execution Required</Label>
                                        <Label htmlFor="commit" className="cursor-pointer text-sm text-slate-600 leading-relaxed font-medium block">I understand this is a highly practical execution program. I commit to putting in the necessary hours. Results strictly depend on my execution.</Label>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Step 4: Payment Target */}
                        <div id="step-4" className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 4 ? 'block' : 'hidden'}`}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-3 tracking-tight text-slate-900">Final Step: Secure Seat.</h2>
                                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">The fee is paid in full. This payment secures your seat.</p>
                            </div>

                            <div className="rounded-2xl border border-[#2563EB] bg-blue-50/40 p-6 shadow-[0_4px_20px_rgba(37,99,235,0.08)]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">Enrollment fee</p>
                                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">GHS 1,000</p>
                                <p className="mt-2 text-[15px] font-medium text-slate-600">Full payment only. No deposit or installment option.</p>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Payment Method</h3>
                                    <p className="text-slate-600 text-sm">Choose how you would like to pay. International users can pay with card.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("moolre")}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                                            paymentMethod === "moolre"
                                                ? "border-[#2563EB] bg-[#2563EB]/10 shadow-[0_0_20px_rgba(37,99,235,0.05)]"
                                                : "border-slate-200 bg-white hover:border-slate-200"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 mb-1">Mobile Money (Ghana)</span>
                                            <span className="text-sm text-gray-500">MTN MoMo, Telecel, AirtelTigo — pay with your phone.</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("paystack")}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                                            paymentMethod === "paystack"
                                                ? "border-[#00c3f7] bg-cyan-50/50 shadow-[0_0_20px_rgba(0,195,247,0.1)]"
                                                : "border-slate-200 bg-white hover:border-slate-200"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#00c3f7]/20 flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5 text-[#00c3f7]" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 mb-1">Card / International</span>
                                            <span className="text-sm text-gray-500">Visa, Mastercard — for those outside Ghana.</span>
                                        </div>
                                    </button>
                                </div>
                                <input type="hidden" name="paymentMethod" value={paymentMethod} />
                            </div>

                        </div>

                        {/* Navigation Buttons footer */}
                        <div className="pt-6 sm:pt-8 border-t border-slate-200 flex items-center justify-between gap-3">
                            <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1} className="group flex items-center gap-2 sm:gap-3 text-slate-500 hover:text-slate-900 hover:bg-transparent px-1 sm:px-2 font-semibold tracking-wide disabled:opacity-30 transition-all shrink-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-transparent group-hover:bg-slate-100 transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="hidden sm:inline">Go Back</span>
                            </Button>

                            {step < totalSteps ? (
                                <Button type="button" onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 sm:px-8 h-11 sm:h-12 font-bold tracking-wide shadow-lg shadow-slate-200 text-sm sm:text-base">
                                    Continue
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-bold tracking-wide shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] disabled:opacity-50">
                                    {isSubmitting ? "Processing..." : "Checkout"}
                                    {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                                </Button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
