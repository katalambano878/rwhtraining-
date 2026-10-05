"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, CreditCard, Settings as SettingsIcon, LogOut, ChevronRight, Menu, Bell, Loader2, ShieldCheck, ArrowUpRight, AlertCircle, GraduationCap, X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminUser = { id: string; email: string; role: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Abandoned Drafts", href: "/admin/drafts", icon: AlertCircle },
        { name: "Applications", href: "/admin/applications", icon: Users },
        { name: "Students", href: "/admin/students", icon: GraduationCap },
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
        { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ];
    const sharedQuery = searchParams.toString();

    const currentPage = navigation.find(n => n.href === pathname)?.name || "Dashboard";

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    function acceptAdmin(loggedInUser: AdminUser) {
        if (loggedInUser.role === "ADMIN" || loggedInUser.role === "SUPER_ADMIN") {
            setUser(loggedInUser);
            setAuthError("");
            return;
        }
        setAuthError("Unauthorized. Administrator privileges required.");
        setUser(null);
        void fetch("/api/auth/logout", { method: "POST" });
    }

    async function checkUser() {
        setLoading(true);
        const res = await fetch("/api/auth/session");
        const data = await res.json().catch(() => ({ user: null }));
        if (data.user) acceptAdmin(data.user);
        setLoading(false);
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setAuthError("");
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.user) {
            setAuthError(data.error || "Invalid login credentials");
            setLoading(false);
            return;
        }
        acceptAdmin(data.user);
        setLoading(false);
    }

    async function handleLogout() {
        setLoading(true);
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setLoading(false);
    }

    if (loading && !user && !authError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-400 text-[13px] font-medium">Loading Mission Control...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 selection:bg-blue-600/20 relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/50 backdrop-blur-[1px]" />

                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <Image src="/remote-logo.png" alt="Logo" width={40} height={30} className="w-10 h-auto object-contain" />
                        </div>
                        <h2 className="mt-6 text-[28px] font-extrabold text-slate-900 tracking-tight">Mission Control</h2>
                        <p className="mt-2 text-[15px] font-medium text-slate-500">Restricted analytics and operations.</p>
                    </div>
                    <form className="mt-8 space-y-6 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)]" onSubmit={handleLogin}>
                        {authError && (
                            <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold text-center animate-in fade-in zoom-in-95">
                                {authError}
                            </div>
                        )}
                        <div className="space-y-5">
                            <div className="space-y-2.5 relative group">
                                <Label className="text-slate-400 font-bold uppercase tracking-widest text-[11px] transition-colors group-focus-within:text-blue-600">Admin Email</Label>
                                <Input type="email" required className="bg-white/50 border-slate-200/60 rounded-2xl h-14 px-5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm hover:bg-white" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2.5 relative group">
                                <Label className="text-slate-400 font-bold uppercase tracking-widest text-[11px] transition-colors group-focus-within:text-blue-600">Master Password</Label>
                                <Input type="password" required className="bg-white/50 border-slate-200/60 rounded-2xl h-14 px-5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm hover:bg-white" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-[0_4px_20px_rgb(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] disabled:opacity-50 transition-all duration-300 group">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <span className="flex items-center gap-2">Authorize Clearance <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                            )}
                        </Button>
                        <div className="text-center pt-4">
                            <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">&larr; Return to public site</Link>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-slate-200/60 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_2px_10px_rgba(37,99,235,0.3)]">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-[15px] font-extrabold tracking-tight text-slate-900">Mission Control</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const href = sharedQuery ? `${item.href}?${sharedQuery}` : item.href;
                    return (
                        <Link key={item.name} href={href}>
                            <span className={`group relative flex items-center px-4 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 ${
                                isActive
                                    ? "bg-blue-50 text-blue-600 border border-blue-100/80"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                            }`}>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />}
                                <item.icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                                {item.name}
                                {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-blue-400" />}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-3 border-t border-slate-200/60 shrink-0">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px] text-white">
                        {user.email?.[0].toUpperCase() || "A"}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[12px] font-bold text-slate-900 truncate">{user.email}</span>
                        <span className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mt-0.5">{user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</span>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold text-[13px] h-10 transition-colors" onClick={handleLogout}>
                    <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600/20">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] border-r border-slate-200/60 bg-white/80 backdrop-blur-xl flex-shrink-0 z-20 sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="absolute right-3 top-3">
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full h-9 w-9 hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Menu className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 tracking-wide">
                            <span className="text-slate-300 hidden sm:inline">Mission Control</span>
                            <span className="text-slate-300 hidden sm:inline">/</span>
                            <span className="text-slate-900">{currentPage}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative cursor-pointer group">
                            <div className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center group-hover:border-slate-300 transition-colors">
                                <Bell className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors" />
                            </div>
                        </div>
                        <Link href="/" target="_blank" className="text-[11px] font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all shadow-sm flex items-center gap-1.5 hidden sm:flex">
                            Live Site <ArrowUpRight className="w-3 h-3 opacity-70" />
                        </Link>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative">
                    <div className="max-w-[1400px] mx-auto relative z-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
