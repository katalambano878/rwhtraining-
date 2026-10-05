"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2, X, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Props = { paidCount: number };

const EMAIL_TEMPLATES = [
    {
        name: "Welcome Message",
        subject: "Welcome to the Masterclass — You're In!",
        body: `Hi {{first_name}},\n\nWelcome to the Elite Web Development & SaaS Masterclass!\n\nYour seat is officially secured. Here are your next steps:\n\n1. Log into your student dashboard\n2. Review the prep materials\n3. Join our Discord community\n\nWe start on October 19, 2026. Get excited!\n\nBest,\nThe Remote Work Hub Team`,
    },
    {
        name: "Payment Reminder",
        subject: "Complete Your Masterclass Payment",
        body: `Hi {{first_name}},\n\nThis is a friendly reminder that you have an outstanding balance for the masterclass.\n\nTo ensure your seat remains secured and you have full access to all resources, please complete your payment at your earliest convenience.\n\nLog in to your student dashboard to make the payment.\n\nBest,\nThe Remote Work Hub Team`,
    },
    {
        name: "Pre-Session Reminder",
        subject: "Masterclass Starts Tomorrow!",
        body: `Hi {{first_name}},\n\nThe masterclass begins tomorrow! Make sure you've:\n\n✅ Set up your development environment\n✅ Downloaded the prep materials\n✅ Joined the Discord community\n✅ Cleared your schedule for the next 4 weeks\n\nSee you there!\n\nBest,\nThe Remote Work Hub Team`,
    },
];

export function SendMessageToStudents({ paidCount }: Props) {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEscapeKey = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && !loading) setOpen(false);
    }, [loading]);

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "";
        };
    }, [open, handleEscapeKey]);

    const applyTemplate = (template: typeof EMAIL_TEMPLATES[0]) => {
        setSubject(template.subject);
        setBody(template.body);
        toast.success(`Template "${template.name}" loaded`);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!body.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/email-students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subject.trim() || "Message from Remote Work Hub Masterclass",
                    body: body.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send");
            toast.success(`Email sent to ${data.sent} of ${data.total} students`);
            setSubject("");
            setBody("");
            setOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-slate-200/60 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">Email Students</h4>
                        <p className="text-xs text-slate-500 font-medium">
                            Send to {paidCount} paid {paidCount === 1 ? "student" : "students"}
                        </p>
                    </div>
                </div>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !loading && setOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/60 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Send Message</h3>
                                <p className="text-[12px] text-slate-400 font-medium mt-0.5">To {paidCount} paid students • Supports {"{{first_name}}"} placeholder</p>
                            </div>
                            <button onClick={() => !loading && setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Templates */}
                        <div className="px-6 pt-5 pb-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Templates</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {EMAIL_TEMPLATES.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => applyTemplate(t)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200 transition-all"
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
                            <div>
                                <Label className="text-slate-600 font-bold text-[12px]">Subject</Label>
                                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Important Update About the Masterclass" className="mt-1.5 rounded-xl h-11" />
                            </div>
                            <div>
                                <Label className="text-slate-600 font-bold text-[12px]">Message Body</Label>
                                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Hi {{first_name}},\n\nYour message here...`} rows={10} required className="mt-1.5 rounded-xl resize-none font-mono text-[13px]" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={loading || !body.trim()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-bold">
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                                    ) : (
                                        <><Send className="w-4 h-4 mr-2" /> Send to {paidCount} students</>
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => !loading && setOpen(false)} className="rounded-xl h-11">Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
