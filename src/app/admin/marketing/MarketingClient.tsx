"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Megaphone, Send, Loader2, Search, Phone, Mail, User,
    CheckCircle2, XCircle, AlertTriangle, Eye, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";

type Lead = {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    tier?: string;
    cohort_id?: string;
    payment_status?: string;
    status?: string;
    is_unfinished?: boolean;
    created_at?: string;
};

const SMS_PRESETS = [
    {
        name: "New Cohort Announcement",
        body: `Hi {{first_name}}! Doctor Barns here. We're launching a brand new cohort of the RWH Elite Web Dev & SaaS Masterclass and I thought of you.

This time: 4 weeks of hands-on building, a 1-month internship at Doctor Barns Tech, and we help you land your first paying client.

Seats are strictly limited. Secure yours now: https://remoteworkhub.org/apply

Questions? WhatsApp: 0209636158
- Remote Work Hub`,
    },
    {
        name: "Urgency / Last Chance",
        body: `{{first_name}}, the new RWH Masterclass cohort is filling up fast. Only a few seats left.

You showed interest before — this is your chance to actually make it happen. Start with just GHS 200 (20% deposit).

Apply now: https://remoteworkhub.org/apply

Don't wait. Once seats are gone, they're gone.
- Doctor Barns, Remote Work Hub`,
    },
    {
        name: "Personal Invitation",
        body: `Hey {{first_name}}, it's Doctor Barns.

I noticed you tried to join our last masterclass but didn't complete enrollment. I want to personally invite you to our new cohort starting soon.

Same promise: build real software, get a 1-month internship, land your first client. We've made it even better this time.

Interested? Just reply YES or apply: https://remoteworkhub.org/apply
- Doctor Barns`,
    },
];

export function MarketingClient({
    leads,
    activeCohortName,
}: {
    leads: Lead[];
    activeCohortName: string;
}) {
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState(SMS_PRESETS[0].body);
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState<{ sent: number; failed: number; errors: string[] } | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showLeads, setShowLeads] = useState(false);

    const smsLeads = useMemo(() => {
        return leads.filter((l) => {
            if (!l.phone?.trim()) return false;
            if (!search) return true;
            return [l.first_name, l.last_name, l.email, l.phone, l.city]
                .some(f => f?.toLowerCase().includes(search.toLowerCase()));
        });
    }, [leads, search]);

    function previewMessage(lead: Lead) {
        return message.replace(/\{\{first_name\}\}/g, lead.first_name || "there");
    }

    async function handleSendAll() {
        if (!message.trim()) {
            toast.error("Write a message first");
            return;
        }
        if (smsLeads.length === 0) {
            toast.error("No leads with phone numbers to send to");
            return;
        }
        if (!confirm(`Send this SMS to ${smsLeads.length} leads? This will use your SMS credits.`)) return;

        setSending(true);
        setResults(null);

        try {
            const res = await fetch("/api/admin/send-marketing-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message_template: message,
                    lead_ids: smsLeads.map(l => l.id),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResults({ sent: data.sent || 0, failed: data.failed || 0, errors: data.errors || [] });
                toast.success(`Sent ${data.sent} SMS messages`);
            } else {
                toast.error(data.error || "Failed to send");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Compose SMS */}
            <Card className="border-slate-200/60 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-600 text-white"><Megaphone className="w-4 h-4" /></div>
                        Compose Re-Engagement SMS
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-[13px] font-medium">
                        Send to {smsLeads.length} non-enrolled leads with phone numbers. Use {"{{first_name}}"} for personalization.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Presets */}
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Templates</p>
                        <div className="flex flex-wrap gap-2">
                            {SMS_PRESETS.map((preset, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMessage(preset.body)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                        message === preset.body
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Editor */}
                    <div>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="text-[14px] font-medium leading-relaxed border-slate-200/60 rounded-xl resize-none"
                            placeholder="Type your SMS message..."
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] text-slate-400 font-medium">
                                {message.length} characters · ~{Math.ceil(message.length / 160)} SMS segment(s)
                            </span>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Eye className="w-3 h-3" /> {showPreview ? "Hide" : "Show"} Preview
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    {showPreview && smsLeads[0] && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Preview for: {smsLeads[0].first_name} {smsLeads[0].last_name} ({smsLeads[0].phone})
                            </p>
                            <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                {previewMessage(smsLeads[0])}
                            </p>
                        </div>
                    )}

                    {/* Send Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSendAll}
                            disabled={sending || smsLeads.length === 0}
                            className="rounded-xl font-bold h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_15px_rgba(37,99,235,0.25)]"
                        >
                            {sending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="w-4 h-4 mr-2" /> Send to {smsLeads.length} Leads</>
                            )}
                        </Button>
                        {sending && (
                            <span className="text-[12px] text-slate-400 font-medium animate-pulse">
                                Sending messages... this may take a moment.
                            </span>
                        )}
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" /> {results.sent} sent
                                </div>
                                {results.failed > 0 && (
                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-red-600">
                                        <XCircle className="w-4 h-4" /> {results.failed} failed
                                    </div>
                                )}
                            </div>
                            {results.errors.length > 0 && (
                                <div className="text-[11px] text-red-500 font-medium space-y-1">
                                    {results.errors.slice(0, 5).map((err, i) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                    {results.errors.length > 5 && <p>...and {results.errors.length - 5} more</p>}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card className="border-slate-200/60 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => setShowLeads(!showLeads)}
                        className="w-full flex items-center justify-between"
                    >
                        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><User className="w-4 h-4" /></div>
                            Non-Enrolled Leads
                            <span className="text-[12px] font-bold text-slate-400 ml-2">({smsLeads.length})</span>
                        </CardTitle>
                        {showLeads ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>
                </CardHeader>

                {showLeads && (
                    <CardContent className="p-0">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search leads..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 rounded-xl text-[13px] border-slate-200/60"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-slate-100 bg-slate-50/30">
                                        <th className="text-left px-6 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">City</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80">
                                    {smsLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <p className="text-[13px] font-bold text-slate-900">{lead.first_name || "—"} {lead.last_name || ""}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {lead.phone || "—"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[12px] text-slate-500 font-medium">{lead.email || "—"}</td>
                                            <td className="px-4 py-3 text-[12px] text-slate-500 font-medium">{lead.city || "—"}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                                                    lead.is_unfinished
                                                        ? "bg-red-50 text-red-600 border-red-200/60"
                                                        : lead.payment_status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200/60"
                                                        : "bg-slate-100 text-slate-500 border-slate-200/60"
                                                }`}>
                                                    {lead.is_unfinished ? "Draft" : lead.payment_status === "PENDING" ? "Unpaid" : lead.status || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {smsLeads.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-[13px] text-slate-400 font-medium">
                                                No leads with phone numbers found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
