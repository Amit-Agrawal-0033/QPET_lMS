"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  requiredPerm?: string;
}

const trainerNav: NavItem[] = [
  { label: "Faculty Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "My Students", href: "/trainer/students", icon: Users, requiredPerm: "viewStudents" },
  { label: "Course Curriculum", href: "/trainer/courses", icon: BookOpen, requiredPerm: "viewCourses" },
  { label: "Certificates", href: "/trainer/certificates", icon: Award, requiredPerm: "viewCertificates" },
  { label: "Security Audit Logs", href: "/trainer/audit-logs", icon: ShieldAlert, requiredPerm: "viewAuditReports" },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === "student") {
            router.push("/student/dashboard");
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
    <div className="min-h-screen flex bg-slate-50/60 text-slate-800 antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <Link href="/trainer/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 p-1 flex items-center justify-center border border-purple-200/60 group-hover:scale-105 transition-transform overflow-hidden">
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
                  <span className="font-bold text-base text-slate-900 tracking-tight">QPET</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                    FACULTY
                  </span>
                </div>
                <p className="text-[11px] text-purple-600 font-semibold">Trainer Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="mt-5 space-y-1 flex-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Faculty Academic Tools
            </p>
            {trainerNav
              .filter((item) => {
                if (!currentUser) return true;
                if (currentUser.role === "admin") return true;
                if (!item.requiredPerm) return true;
                return !!currentUser.permissions?.[item.requiredPerm];
              })
              .map((item) => {
                const active = pathname === item.href || (item.href !== "/trainer/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                      : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.name || "Faculty Trainer"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser?.identifier || "Trainer"}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
              Trainer
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-900">QPET Faculty Portal</span>
          </div>
          <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
            TRAINER
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
