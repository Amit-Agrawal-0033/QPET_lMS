"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function TrainerErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Trainer Portal caught error:", error);
  }, [error]);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md text-center my-12">
      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1">
        Faculty Dashboard Error
      </h2>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        We were unable to render this section of the Faculty Portal. This may occur if a new portal build was published.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Dashboard</span>
        </button>
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </Link>
      </div>
    </div>
  );
}
