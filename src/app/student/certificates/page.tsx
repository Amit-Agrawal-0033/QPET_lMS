"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function StudentCertificatesPage() {
  const [data, setData] = useState<{ certificates: any[]; enrollments: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/certificates");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const { certificates, enrollments } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Award className="w-6 h-6 text-yellow-400" />
          My Completion Certificates
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Download your authorized QPET completion certificates with embedded digital verification QR codes.
        </p>
      </div>

      {/* Issued Certificates */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Awarded Certificates ({certificates.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates && certificates.length > 0 ? (
            certificates.map((cert: any) => (
              <div
                key={cert._id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-300 font-bold border border-yellow-500/30 inline-block mb-2">
                      {cert.certificateNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white">{cert.courseName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Duration: {cert.courseDuration} • Grade:{" "}
                      <strong className="text-teal-300">{cert.grade || "A"}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      cert.status === "issued"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Issue Date:</span>
                    <span className="text-white font-medium">
                      {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Enrollment Number:</span>
                    <span className="font-mono text-teal-300">{cert.enrollmentNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {cert.status === "issued" ? (
                    <>
                      <a
                        href={`/api/pdf/certificate/${cert._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20 transition-all font-medium"
                      >
                        <Download className="w-4 h-4 text-slate-950" />
                        <span>Download Certificate PDF</span>
                      </a>

                      <Link
                        href={`/verify-certificate?cert=${encodeURIComponent(
                          cert.certificateNumber
                        )}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        <span>Verify</span>
                      </Link>
                    </>
                  ) : (
                    <div className="w-full p-2.5 text-center text-xs text-rose-300 bg-rose-950/30 rounded-xl border border-rose-900/50">
                      This certificate has been revoked. Contact administration.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
              You do not have any issued certificates yet.
            </div>
          )}
        </div>
      </div>

      {/* Courses Certification Status */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          Course Completion & Certificate Eligibility
        </h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Course Name</th>
                <th className="py-3.5 px-4">Enrollment Number</th>
                <th className="py-3.5 px-4">Fee Balance</th>
                <th className="py-3.5 px-4">Eligibility Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {enrollments.map((enr: any) => (
                <tr key={enr._id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {enr.courseNameSnapshot}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-teal-300">
                    {enr.enrollmentNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    {enr.outstandingBalance === 0 ? (
                      <span className="text-emerald-400 font-semibold">₹0 (Cleared)</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">
                        ₹{enr.outstandingBalance} pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        enr.certificateStatus === "issued"
                          ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                          : enr.outstandingBalance === 0
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {enr.certificateStatus === "issued"
                        ? "Issued"
                        : enr.outstandingBalance === 0
                        ? "Eligible (Awaiting Admin Issuance)"
                        : "Clear fee balance to become eligible"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
