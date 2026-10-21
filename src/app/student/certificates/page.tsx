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
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-40 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-sm" />
      </div>
    );
  }

  const { certificates, enrollments } = data;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Completion Certificates
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {certificates.length} Issued
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Download your authorized QPET completion certificates with embedded digital verification QR codes.
        </p>
      </div>

      {/* Issued Certificates */}
      <div className="space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Awarded Certificates ({certificates.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates && certificates.length > 0 ? (
            certificates.map((cert: any) => (
              <div
                key={cert._id}
                className="rounded-2xl bg-white border border-slate-200/80 p-6 space-y-6 hover:shadow-md transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60 inline-block mb-2">
                      {cert.certificateNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{cert.courseName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Duration: {cert.courseDuration} • Grade:{" "}
                      <strong className="text-blue-600">{cert.grade || "A"}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      cert.status === "issued"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Issue Date:</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Enrollment Number:</span>
                    <span className="font-mono text-blue-600 font-semibold">{cert.enrollmentNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {cert.status === "issued" ? (
                    <>
                      <a
                        href={`/api/pdf/certificate/${cert._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all font-medium"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>Download Certificate PDF</span>
                      </a>

                      <Link
                        href={`/verify-certificate?cert=${encodeURIComponent(
                          cert.certificateNumber
                        )}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Verify</span>
                      </Link>
                    </>
                  ) : (
                    <div className="w-full p-2.5 text-center text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                      This certificate has been revoked. Contact administration.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-xs text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              You do not have any issued certificates yet.
            </div>
          )}
        </div>
      </div>

      {/* Courses Certification Status */}
      <div className="space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Course Completion & Certificate Eligibility
        </h2>

        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Course Name</th>
                <th className="py-3.5 px-4">Enrollment Number</th>
                <th className="py-3.5 px-4">Fee Balance</th>
                <th className="py-3.5 px-4">Eligibility Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {enrollments.map((enr: any) => (
                <tr key={enr._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {enr.courseNameSnapshot}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-blue-600">
                    {enr.enrollmentNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    {enr.outstandingBalance === 0 ? (
                      <span className="text-emerald-600 font-semibold">₹0 (Cleared)</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        ₹{enr.outstandingBalance} pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        enr.certificateStatus === "issued"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : enr.outstandingBalance === 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
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
