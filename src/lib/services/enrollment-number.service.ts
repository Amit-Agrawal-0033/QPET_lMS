import { connectDB } from "../db/mongoose";
import { EnrollmentCounter } from "../models/EnrollmentCounter";
import { Certificate } from "../models/Certificate";
import { Enrollment } from "../models/Enrollment";
import { FeeReceipt } from "../models/FeeReceipt";

/**
 * Generates an atomic, concurrency-safe enrollment number.
 * Format: QPET-YYYY-NNNNN (e.g. QPET-2026-00001)
 */
export async function generateEnrollmentNumber(targetYear?: number): Promise<string> {
  await connectDB();
  const year = targetYear || new Date().getFullYear();

  // Find highest existing enrollment sequence for this year to prevent collision
  const prefix = `QPET-${year}-`;
  const latest = await Enrollment.findOne(
    { enrollmentNumber: { $regex: `^${prefix}` } },
    { enrollmentNumber: 1 },
    { sort: { enrollmentNumber: -1 } }
  ).lean();

  let maxExistingSeq = 0;
  if (latest && latest.enrollmentNumber) {
    const parts = latest.enrollmentNumber.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) maxExistingSeq = num;
  }

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let sequence = counter?.lastSequence || 1;
  if (sequence <= maxExistingSeq) {
    const updated = await EnrollmentCounter.findOneAndUpdate(
      { year },
      { $set: { lastSequence: maxExistingSeq + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    sequence = updated?.lastSequence || (maxExistingSeq + 1);
  }

  const paddedSequence = String(sequence).padStart(5, "0");
  return `QPET-${year}-${paddedSequence}`;
}

/**
 * Generates an atomic, concurrency-safe fee receipt number.
 * Format: QPET-REC-YYYY-NNNNN (e.g. QPET-REC-2026-00001)
 */
export async function generateReceiptNumber(targetYear?: number): Promise<string> {
  await connectDB();
  const year = targetYear || new Date().getFullYear();
  const receiptYearKey = -(year * 10 + 1);

  const prefix = `QPET-REC-${year}-`;
  const latest = await FeeReceipt.findOne(
    { receiptNumber: { $regex: `^${prefix}` } },
    { receiptNumber: 1 },
    { sort: { receiptNumber: -1 } }
  ).lean();

  let maxExistingSeq = 0;
  if (latest && latest.receiptNumber) {
    const parts = latest.receiptNumber.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) maxExistingSeq = num;
  }

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year: receiptYearKey },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let sequence = counter?.lastSequence || 1;
  if (sequence <= maxExistingSeq) {
    const updated = await EnrollmentCounter.findOneAndUpdate(
      { year: receiptYearKey },
      { $set: { lastSequence: maxExistingSeq + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    sequence = updated?.lastSequence || (maxExistingSeq + 1);
  }

  const paddedSequence = String(sequence).padStart(5, "0");
  return `QPET-REC-${year}-${paddedSequence}`;
}

/**
 * Generates an atomic, concurrency-safe certificate number.
 * Format: QPET-CERT-YYYY-NNNNN (e.g. QPET-CERT-2026-00001)
 */
export async function generateCertificateNumber(targetYear?: number): Promise<string> {
  await connectDB();
  const year = targetYear || new Date().getFullYear();
  const certYearKey = -(year * 10 + 2);

  const prefix = `QPET-CERT-${year}-`;
  const latest = await Certificate.findOne(
    { certificateNumber: { $regex: `^${prefix}` } },
    { certificateNumber: 1 },
    { sort: { certificateNumber: -1 } }
  ).lean();

  let maxExistingSeq = 0;
  if (latest && latest.certificateNumber) {
    const parts = latest.certificateNumber.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) maxExistingSeq = num;
  }

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year: certYearKey },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let sequence = counter?.lastSequence || 1;
  if (sequence <= maxExistingSeq) {
    const updated = await EnrollmentCounter.findOneAndUpdate(
      { year: certYearKey },
      { $set: { lastSequence: maxExistingSeq + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    sequence = updated?.lastSequence || (maxExistingSeq + 1);
  }

  const paddedSequence = String(sequence).padStart(5, "0");
  return `QPET-CERT-${year}-${paddedSequence}`;
}
