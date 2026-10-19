import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Enrollment } from "@/lib/models/Enrollment";
import { Payment } from "@/lib/models/Payment";
import { Installment } from "@/lib/models/Installment";
import { Certificate } from "@/lib/models/Certificate";
import { Course } from "@/lib/models/Course";
import { generateExcelCsv } from "@/lib/export/csv";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type") || "students";
    const format = searchParams.get("format") || "json";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `qpet_report_${type}_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "students") {
      headers = [
        "Full Name",
        "Guardian Name",
        "Mobile Number",
        "Email",
        "Gender",
        "Registration Date",
        "Status",
        "Address",
        "Qualification",
      ];
      const students = await StudentProfile.find(dateFilter).sort({ createdAt: -1 }).lean();
      rows = students.map((s) => [
        s.fullName,
        s.fatherOrGuardianName,
        s.mobileNumber,
        s.email || "N/A",
        s.gender || "N/A",
        new Date(s.registrationDate).toLocaleDateString("en-IN"),
        s.registrationStatus.toUpperCase(),
        s.address,
        s.qualification || "N/A",
      ]);
    } else if (type === "enrollments") {
      headers = [
        "Enrollment Number",
        "Student Name",
        "Mobile Number",
        "Course Name",
        "Enrollment Date",
        "Duration",
        "Total Fee (INR)",
        "Paid Amount (INR)",
        "Balance (INR)",
        "Payment Status",
        "Enrollment Status",
        "Certificate Status",
      ];
      const enrollments = await Enrollment.find(dateFilter)
        .populate("studentId", "fullName mobileNumber")
        .sort({ createdAt: -1 })
        .lean();
      rows = enrollments.map((e: any) => [
        e.enrollmentNumber,
        e.studentId?.fullName || "N/A",
        e.studentId?.mobileNumber || "N/A",
        e.courseNameSnapshot,
        new Date(e.enrollmentDate).toLocaleDateString("en-IN"),
        `${e.durationMonthsSnapshot} Months`,
        e.totalFee,
        e.paidAmount,
        e.outstandingBalance,
        e.paymentStatus.toUpperCase(),
        e.enrollmentStatus.toUpperCase(),
        e.certificateStatus.toUpperCase(),
      ]);
    } else if (type === "payments") {
      headers = [
        "Receipt Number",
        "Payment Date",
        "Enrollment Number",
        "Student Name",
        "Payment Method",
        "Amount Received (INR)",
        "Txn / Ref No",
        "Recorded By",
        "Remarks",
      ];
      const pFilter = fromDate || toDate ? { paymentDate: dateFilter.createdAt } : {};
      const payments = await Payment.find(pFilter)
        .populate("enrollmentId", "enrollmentNumber")
        .populate("studentId", "fullName")
        .sort({ paymentDate: -1 })
        .lean();
      rows = payments.map((p: any) => [
        p.receiptNumber || "N/A",
        new Date(p.paymentDate).toLocaleDateString("en-IN"),
        p.enrollmentId?.enrollmentNumber || "N/A",
        p.studentId?.fullName || "N/A",
        p.paymentMethod.toUpperCase(),
        p.amount,
        p.transactionReference || "N/A",
        p.recordedByAdminName,
        p.remarks || "",
      ]);
    } else if (type === "outstanding_balances") {
      headers = [
        "Enrollment Number",
        "Student Name",
        "Mobile Number",
        "Course Name",
        "Total Agreed Fee (INR)",
        "Paid Amount (INR)",
        "Outstanding Balance (INR)",
        "Payment Status",
      ];
      const enrollments = await Enrollment.find({
        outstandingBalance: { $gt: 0 },
        enrollmentStatus: { $ne: "cancelled" },
      })
        .populate("studentId", "fullName mobileNumber")
        .sort({ outstandingBalance: -1 })
        .lean();
      rows = enrollments.map((e: any) => [
        e.enrollmentNumber,
        e.studentId?.fullName || "N/A",
        e.studentId?.mobileNumber || "N/A",
        e.courseNameSnapshot,
        e.totalFee,
        e.paidAmount,
        e.outstandingBalance,
        e.paymentStatus.toUpperCase(),
      ]);
    } else if (type === "installments") {
      headers = [
        "Enrollment Number",
        "Student Name",
        "Mobile Number",
        "Installment No",
        "Amount (INR)",
        "Due Date",
        "Status",
        "Paid Date",
      ];
      const installments = await Installment.find()
        .populate("enrollmentId", "enrollmentNumber")
        .populate("studentId", "fullName mobileNumber")
        .sort({ dueDate: 1 })
        .lean();
      rows = installments.map((i: any) => [
        i.enrollmentId?.enrollmentNumber || "N/A",
        i.studentId?.fullName || "N/A",
        i.studentId?.mobileNumber || "N/A",
        i.installmentNumber,
        i.amount,
        new Date(i.dueDate).toLocaleDateString("en-IN"),
        i.status.toUpperCase(),
        i.paidDate ? new Date(i.paidDate).toLocaleDateString("en-IN") : "Pending",
      ]);
    } else if (type === "certificates") {
      headers = [
        "Certificate Number",
        "Student Name",
        "Enrollment Number",
        "Course Name",
        "Course Duration",
        "Issue Date",
        "Status",
        "Issued By",
        "Revocation Reason",
      ];
      const certs = await Certificate.find().sort({ issueDate: -1 }).lean();
      rows = certs.map((c) => [
        c.certificateNumber,
        c.studentName,
        c.enrollmentNumber,
        c.courseName,
        c.courseDuration,
        new Date(c.issueDate).toLocaleDateString("en-IN"),
        c.status.toUpperCase(),
        c.issuedByAdminName,
        c.revocationReason || "N/A",
      ]);
    } else if (type === "course_fees") {
      headers = [
        "Course Title",
        "Course Code",
        "Default Fee (INR)",
        "Active Enrollments",
        "Total Agreed Fees (INR)",
        "Total Collected (INR)",
        "Outstanding Fees (INR)",
      ];
      const courses = await Course.find().lean();
      rows = await Promise.all(
        courses.map(async (c) => {
          const enrollments = await Enrollment.find({
            courseId: c._id,
            enrollmentStatus: { $ne: "cancelled" },
          }).lean();
          const totalAgreed = enrollments.reduce((sum, e) => sum + e.totalFee, 0);
          const totalPaid = enrollments.reduce((sum, e) => sum + e.paidAmount, 0);
          const outstanding = enrollments.reduce((sum, e) => sum + e.outstandingBalance, 0);
          return [
            c.title,
            c.code,
            c.defaultFee,
            enrollments.length,
            totalAgreed,
            totalPaid,
            outstanding,
          ];
        })
      );
    }

    if (format === "csv") {
      const csvString = generateExcelCsv(headers, rows);
      return new NextResponse(csvString, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reportType: type,
      headers,
      rows,
      count: rows.length,
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report." },
      { status: 500 }
    );
  }
}
