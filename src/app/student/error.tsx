"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function StudentErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student Portal caught error:", error);
  }, [error]);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md text-center my-12">
      <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1">
        Student Portal Error
      </h2>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        We encountered an error loading your student account data. Please reload to refresh your session.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Portal</span>
        </button>
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}
