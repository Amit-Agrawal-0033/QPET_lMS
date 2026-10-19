import Link from "next/link";
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">QPET LMS</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              QPET Institute of Information Technology is dedicated to providing quality professional education, practical computer training, and industry-recognized certifications.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span>© {new Date().getFullYear()} QPET LMS. All rights reserved.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-teal-400 transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link
                  href="/verify-certificate"
                  className="flex items-center gap-1.5 hover:text-teal-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  Public Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Administrative Office
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>QPET Computer Academy & IT Learning Campus</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@qpet.org</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
