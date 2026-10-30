"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function TrainerAuditLogsPage() {
  const router = useRouter();

  useEffect(() => {
    // Audit logs are strictly restricted to Administrators.
    // Immediately redirect non-admin faculty to dashboard.
    const timer = setTimeout(() => {
      router.replace("/trainer/dashboard");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-rose-200/80 p-8 sm:p-10 text-center max-w-md w-full shadow-lg shadow-rose-500/5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Access Prohibited</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          System Security Audit Trails are strictly restricted to <strong>Administrator</strong> accounts. Trainer accounts are not authorized to view or access security audit logs.
        </p>
        <div className="mt-6">
          <Link
            href="/trainer/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
