"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <Link href="/student/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-white tracking-tight">QPET</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    STUDENT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Student Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 flex-1">
            {studentNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-teal-600 text-white shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Public verify quick link */}
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/verify-certificate"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-teal-300 hover:bg-slate-800/40 transition-colors"
            >
              <span>Public Verification</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-400">
              QPET Student Portal
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Student Dashboard</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
