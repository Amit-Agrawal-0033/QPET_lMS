"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export interface CatalogCourse {
  _id: string;
  code: string;
  title: string;
  description?: string;
  durationMonths: number;
  durationText?: string;
  defaultFee: number;
}

interface HomeCoursesCatalogProps {
  initialCourses?: CatalogCourse[];
}

export default function HomeCoursesCatalog({ initialCourses = [] }: HomeCoursesCatalogProps) {
  const [courses, setCourses] = useState<CatalogCourse[]>(initialCourses);
  const [loading, setLoading] = useState(initialCourses.length === 0);

  useEffect(() => {
    async function refreshCourses() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
            setCourses(data.courses);
          }
        }
      } catch (err) {
        // Silently preserve initial courses
      } finally {
        setLoading(false);
      }
    }

    refreshCourses();
  }, []);

  return (
    <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-white/60 border-y border-[#3978E8]/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A89A]/10 text-[#16A89A] text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Industry-Recognized Curriculum
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#173B70] tracking-tight">
              Computer Courses Offered
            </h2>
            <p className="text-[#173B70]/75 text-xs sm:text-sm font-normal mt-1 max-w-2xl">
              Practical, job-oriented computer training programs with structured syllabus, lab assignments, and official certifications.
            </p>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] shadow-md shadow-[#3978E8]/25 hover:opacity-95 hover:-translate-y-0.5 transition-all group shrink-0"
          >
            <span>Enroll in a Course</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course._id}
                className="rounded-2xl bg-white border border-[#3978E8]/20 p-6 flex flex-col justify-between shadow-[0_8px_25px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_35px_-5px_rgba(57,120,232,0.12)] hover:border-[#3978E8]/40 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#173B70]/10 text-[#173B70] font-black border border-[#173B70]/15">
                      {course.code}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#16A89A]/10 text-[#16A89A] border border-[#16A89A]/25 text-xs font-bold">
                      {course.durationText || `${course.durationMonths} Months`}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#173B70] group-hover:text-[#3978E8] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#173B70]/70 leading-relaxed line-clamp-3 font-normal">
                    {course.description || "Comprehensive hands-on computer training, practical lab work, and professional certification."}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-[#3978E8]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#173B70]/60 uppercase font-bold tracking-wider block">
                      Course Tuition Fee
                    </span>
                    <span className="text-lg font-black text-[#173B70]">
                      ₹{(course.defaultFee || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Link
                    href={`/register?course=${course._id}`}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#173B70] hover:bg-[#3978E8] transition-colors shadow-xs"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))
          ) : loading ? (
            <div className="col-span-full text-center py-16 text-[#173B70]/70 text-sm bg-white/50 rounded-2xl border border-dashed border-[#3978E8]/30">
              Loading QPET courses catalog...
            </div>
          ) : (
            <div className="col-span-full text-center py-16 text-[#173B70]/70 text-sm bg-white/50 rounded-2xl border border-dashed border-[#3978E8]/30">
              No active courses found. Please contact administration.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
