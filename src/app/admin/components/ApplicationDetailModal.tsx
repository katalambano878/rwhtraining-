"use client";

import { X, Mail, Phone, MapPin, Briefcase, BookOpen, FileText, CreditCard, Clock, Trash2, Loader2, CheckCircle2, ShieldCheck, User, XCircle, Clock3, Banknote, Edit3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { deleteApplicationAction } from "@/app/actions/delete-application";
import { approveApplicationAction } from "@/app/actions/approve-application";
import {
  setApplicationStatusAction,
  markApplicationPaidNoOnboardAction,
  updateApplicationFieldsAction,
} from "@/app/actions/admin-control";
import { toast } from "sonner";

export type ApplicationRecord = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
  city?: string | null;
  class_format?: string | null;
  occupation?: string | null;
  experience?: string | null;
  reason?: string | null;
  tier?: string | null;
  amount_ghs?: number | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  status?: string | null;
  is_unfinished?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  balance_due?: number | null;
};

interface ApplicationDetailModalProps {
  application: ApplicationRecord | null;
  onClose: () => void;
}

export function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", city: "" });

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!application) return;
    document.addEventListener("keydown", handleEscapeKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [application, handleEscapeKey]);

  useEffect(() => {
    if (application) {
      setEditForm({
        first_name: application.first_name || "",
        last_name: application.last_name || "",
        email: application.email || "",
        phone: application.phone || "",
        city: application.city || "",
      });
      setIsEditing(false);
    }
  }, [application]);

  if (!application) return null;

  const fullName = [application.first_name, application.last_name].filter(Boolean).join(" ") || "Unknown";
  const isDraft = application.is_unfinished === true;
  const isAlreadyApproved = application.payment_status === "PAID" && application.status === "APPROVED";

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this ${isDraft ? "draft" : "application"}? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteApplicationAction(application.id);
      if (res.success) { toast.success(`${isDraft ? "Draft" : "Application"} deleted successfully.`); onClose(); }
      else toast.error(`Failed to delete: ${res.error}`);
    } catch { toast.error("An unexpected error occurred while deleting."); }
    finally { setIsDeleting(false); }
  };

  const handleApprove = async () => {
    if (!confirm("Approve this application and mark as PAID?\n\nThis will:\n- Set payment status to PAID\n- Set status to APPROVED\n- Create a student account\n- Send login credentials via email\n\nProceed?")) return;
    setIsApproving(true);
    try {
      const res = await approveApplicationAction(application.id);
      if (res.success) {
        if ("warning" in res && res.warning) toast.warning(res.warning);
        else toast.success("Application approved! Student account created and credentials sent.");
        onClose();
      } else toast.error(`Failed: ${res.error}`);
    } catch { toast.error("An unexpected error occurred."); }
    finally { setIsApproving(false); }
  };

  const handleStatusChange = async (status: "REJECTED" | "WAITLISTED" | "PENDING_REVIEW") => {
    const labels: Record<string, string> = { REJECTED: "Reject", WAITLISTED: "Waitlist", PENDING_REVIEW: "Reset to Pending" };
    if (!confirm(`${labels[status]} this application?`)) return;
    setActionLoading(status);
    try {
      const res = await setApplicationStatusAction(application.id, status);
      if (res.success) { toast.success(`Application ${status.toLowerCase().replace("_", " ")}`); onClose(); }
      else toast.error(res.error);
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  const handleMarkPaid = async () => {
    if (!confirm("Mark as PAID without creating a student account?\n\nUse this when you'll handle onboarding later, or the student already has an account.")) return;
    setActionLoading("mark_paid");
    try {
      const res = await markApplicationPaidNoOnboardAction(application.id);
      if (res.success) { toast.success("Marked as paid (no onboarding)"); onClose(); }
      else toast.error(res.error);
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  const handleSaveEdit = async () => {
    setActionLoading("edit");
    try {
      const res = await updateApplicationFieldsAction(application.id, editForm);
      if (res.success) { toast.success("Application updated"); setIsEditing(false); onClose(); }
      else toast.error(res.error);
    } catch { toast.error("Failed to save"); }
    finally { setActionLoading(null); }
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) => {
    if (value == null || value === "") return null;
    return (
      <div className="flex items-start gap-3.5 py-3.5 border-b border-slate-100/80 last:border-0">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
          <p className="text-[14px] text-slate-900 font-bold tracking-tight">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/60 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">{fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm ${isDraft ? "bg-red-50 text-red-700 border border-red-200/60" : "bg-blue-50 text-blue-700 border border-blue-200/60"}`}>
                {isDraft ? "Abandoned Draft" : "Completed Application"}
              </span>
              {!isDraft && application.status && (
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm border ${
                  application.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                  application.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200/60" :
                  application.status === "WAITLISTED" ? "bg-amber-50 text-amber-700 border-amber-200/60" :
                  "bg-slate-50 text-slate-600 border-slate-200/60"
                }`}>
                  {application.status.replace("_", " ")}
                </span>
              )}
              {!isDraft && application.payment_status && (
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-widest shadow-sm ${
                  application.payment_status === "PAID"
                    ? (application.balance_due != null && application.balance_due > 0)
                      ? "bg-amber-50 text-amber-700 border-amber-200/60"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                    : "bg-amber-50 text-amber-700 border-amber-200/60"
                }`}>
                  Payment: {application.payment_status === "PAID"
                    ? (application.balance_due != null && application.balance_due > 0)
                      ? `Partial — GHS ${application.balance_due} due`
                      : "PAID (full)"
                    : application.payment_status}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="rounded-full hover:bg-blue-50 h-9 w-9 text-slate-400 hover:text-blue-600" title="Edit fields">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="rounded-full hover:bg-red-50 hover:text-red-600 h-9 w-9 text-slate-400" title="Delete">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 h-9 w-9">
              <X className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex-shrink-0 flex flex-wrap gap-2 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          {!isAlreadyApproved && (
            <Button size="sm" onClick={handleApprove} disabled={isApproving} className="rounded-xl h-8 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              {isApproving ? "Approving..." : "Approve & Onboard"}
            </Button>
          )}
          {!isAlreadyApproved && application.payment_status !== "PAID" && (
            <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={actionLoading === "mark_paid"} className="rounded-xl h-8 text-[11px] font-bold gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              {actionLoading === "mark_paid" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Banknote className="w-3 h-3" />}
              Mark Paid (no onboard)
            </Button>
          )}
          {application.status !== "WAITLISTED" && application.status !== "APPROVED" && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("WAITLISTED")} disabled={actionLoading === "WAITLISTED"} className="rounded-xl h-8 text-[11px] font-bold gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50">
              {actionLoading === "WAITLISTED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock3 className="w-3 h-3" />}
              Waitlist
            </Button>
          )}
          {application.status !== "REJECTED" && application.status !== "APPROVED" && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("REJECTED")} disabled={actionLoading === "REJECTED"} className="rounded-xl h-8 text-[11px] font-bold gap-1.5 border-red-200 text-red-700 hover:bg-red-50">
              {actionLoading === "REJECTED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Reject
            </Button>
          )}
          {(application.status === "REJECTED" || application.status === "WAITLISTED") && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("PENDING_REVIEW")} disabled={actionLoading === "PENDING_REVIEW"} className="rounded-xl h-8 text-[11px] font-bold gap-1.5">
              {actionLoading === "PENDING_REVIEW" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock3 className="w-3 h-3" />}
              Reset to Pending
            </Button>
          )}
          {isAlreadyApproved && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              Approved & Paid
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {/* Edit form */}
          {isEditing && (
            <section className="bg-blue-50/50 p-5 rounded-2xl border-2 border-dashed border-blue-200">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5" /> Edit Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500">First name</Label>
                  <Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="mt-1 h-9 text-[13px]" />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500">Last name</Label>
                  <Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="mt-1 h-9 text-[13px]" />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500">Email</Label>
                  <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 h-9 text-[13px]" />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500">Phone</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="mt-1 h-9 text-[13px]" />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500">City</Label>
                  <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="mt-1 h-9 text-[13px]" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={handleSaveEdit} disabled={actionLoading === "edit"} className="rounded-xl h-8 text-[12px] font-bold gap-1">
                  {actionLoading === "edit" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-8 text-[12px] font-bold">Cancel</Button>
              </div>
            </section>
          )}

          <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Contact & Identity
            </h3>
            <div className="space-y-1">
              <DetailRow icon={Mail} label="Email" value={application.email} />
              <DetailRow icon={Phone} label="Phone / WhatsApp" value={application.phone} />
              <DetailRow icon={User} label="Age" value={application.age != null ? `${application.age} years old` : null} />
              <DetailRow icon={MapPin} label="City / Location" value={application.city} />
              <DetailRow icon={BookOpen} label="Class format" value={application.class_format === "online" ? "Online" : application.class_format === "hybrid" ? "Hybrid" : undefined} />
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Background
            </h3>
            <div className="space-y-1">
              <DetailRow icon={Briefcase} label="Occupation" value={application.occupation} />
              <DetailRow icon={BookOpen} label="Experience Level" value={application.experience} />
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Motivation
            </h3>
            {application.reason ? (
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{application.reason}</p>
              </div>
            ) : (
              <p className="text-slate-400 text-[13px] italic font-medium">Not provided</p>
            )}
          </section>

          {!isDraft && (
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </h3>
              <div className="space-y-1">
                <DetailRow icon={CreditCard} label="Tier" value={application.tier ? `${application.tier}%` : null} />
                <DetailRow icon={CreditCard} label="Amount (GHS)" value={application.amount_ghs != null ? String(application.amount_ghs) : null} />
                <DetailRow icon={CreditCard} label="Payment Reference" value={application.payment_reference} />
              </div>
            </section>
          )}

          <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Timestamps
            </h3>
            <div className="space-y-1">
              <DetailRow icon={Clock} label="Started" value={application.created_at ? new Date(application.created_at).toLocaleString() : null} />
              <DetailRow icon={Clock} label="Last Updated" value={application.updated_at ? new Date(application.updated_at).toLocaleString() : null} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
