"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  BookOpen,
  FileCheck2,
  CreditCard,
  Receipt,
  Award,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  requiredPerm?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Trainer Management", href: "/admin/trainers", icon: UserCog, adminOnly: true },
  { label: "Students", href: "/admin/students", icon: Users, requiredPerm: "viewStudents" },
  { label: "Registrations", href: "/admin/registrations", icon: UserCheck, requiredPerm: "viewRegistrations" },
  { label: "Courses", href: "/admin/courses", icon: BookOpen, requiredPerm: "viewCourses" },
  { label: "Enrollments", href: "/admin/enrollments", icon: FileCheck2, requiredPerm: "viewEnrollments" },
  { label: "Fees & Payments", href: "/admin/fees", icon: CreditCard, requiredPerm: "viewFees" },
  { label: "Fee Receipts", href: "/admin/receipts", icon: Receipt, requiredPerm: "viewReceipts" },
  { label: "Certificates", href: "/admin/certificates", icon: Award, requiredPerm: "viewCertificates" },
  { label: "Reports & Export", href: "/admin/reports", icon: FileSpreadsheet, requiredPerm: "viewReports" },
  { label: "Audit Reports", href: "/admin/audit-logs", icon: ShieldAlert, requiredPerm: "viewAuditReports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          if (data.user.role === "trainer") {
            router.push("/trainer/dashboard");
            return;
          }
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

  const visibleNavItems = navItems.filter((item) => {
    if (!currentUser) return true; // optimistic while fetching
    if (currentUser.role === "admin") return true;
    if (item.adminOnly) return false;
    if (!item.requiredPerm) return true;
    return !!currentUser.permissions?.[item.requiredPerm];
  });

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 antialiased">
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
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 group-hover:scale-105 transition-transform overflow-hidden">
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
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      currentUser?.role === "trainer"
                        ? "bg-purple-50 text-purple-700 border-purple-200/60"
                        : "bg-blue-50 text-blue-700 border-blue-200/60"
                    }`}
                  >
                    {currentUser?.role === "trainer" ? "FACULTY" : "PORTAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {currentUser?.role === "trainer" ? "Trainer Portal" : "Education Admin"}
                </p>
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
              Management
            </p>
            {visibleNavItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick link to public verify */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              href="/verify-certificate"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Public Verification
              </span>
              <span className="text-[10px] text-slate-400">↗</span>
            </Link>
          </div>
        </div>

        {/* User Info & Logout footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentUser?.role === "trainer"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {currentUser?.name || (currentUser?.role === "trainer" ? "Trainer" : "Administrator")}
                  </p>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      currentUser?.role === "trainer"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {currentUser?.role === "trainer" ? "TRAINER" : "ADMIN"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {currentUser?.identifier || "admin077@qpet.in"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-500 hidden sm:flex items-center gap-2">
              <span className="text-slate-800 font-semibold">QPET LMS</span>
              <span>/</span>
              <span>
                {currentUser?.role === "trainer" ? "Trainer Faculty Portal" : "Administrative Operations"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
