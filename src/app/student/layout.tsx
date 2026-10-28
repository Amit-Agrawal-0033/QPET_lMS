"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Receipt,
  Award,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";

const studentNav = [
  { label: "My Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "My Fees & Installments", href: "/student/fees", icon: CreditCard },
  { label: "My Receipts", href: "/student/receipts", icon: Receipt },
  { label: "My Certificates", href: "/student/certificates", icon: Award },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === "admin") {
            router.push("/admin/dashboard");
            return;
          }
          if (data.user.role === "trainer") {
            router.push("/trainer/dashboard");
            return;
          }
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#F0FDF4]/40 via-[#F0FDFA]/30 to-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-teal-600 selection:text-white">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-teal-100/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-[0_4px_20px_-4px_rgba(20,184,166,0.08)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-5 border-b border-teal-50">
            <Link href="/student/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-50 p-1 flex items-center justify-center shadow-xs border border-teal-200/60 group-hover:scale-105 transition-all overflow-hidden">
                <Image
                  src="/images/QPET PNG.png"
                  alt="QPET Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">QPET</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                    STUDENT
                  </span>
                </div>
                <p className="text-[11px] text-teal-600 font-semibold">Learning Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 flex-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-teal-800/60 mb-2">
              My Learning Path
            </p>
            {studentNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25 font-bold"
                      : "text-slate-600 hover:text-teal-800 hover:bg-teal-50/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Public verify quick link */}
          <div className="pt-4 border-t border-teal-50">
            <Link
              href="/verify-certificate"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-600 hover:text-teal-700 hover:bg-teal-50/60 transition-colors border border-dashed border-teal-200"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="font-semibold">Verify Certificate</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-teal-50 bg-teal-50/30">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.name || "Student"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser?.identifier || "Student"}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200/70 transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-teal-100/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_3px_rgba(20,184,166,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-xs font-bold text-slate-700">QPET Student Learning Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-[11px] shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Enrolled Candidate</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
