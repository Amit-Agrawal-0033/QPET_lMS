import { connectDB } from "../db/mongoose";
import { EnrollmentCounter } from "../models/EnrollmentCounter";

/**
 * Generates an atomic, concurrency-safe enrollment number.
 * Format: QPET-YYYY-NNNNN (e.g. QPET-2026-00001)
 *
 * Rules:
 * - Uses current calendar year.
 * - Starts at 00001 for each year.
 * - Atomically increments counter using MongoDB findOneAndUpdate with $inc.
 * - Guarantees uniqueness even under concurrent requests.
 */
export async function generateEnrollmentNumber(targetYear?: number): Promise<string> {
  await connectDB();
  const year = targetYear || new Date().getFullYear();

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = counter.lastSequence;
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

  // We can use a dedicated counter or distinguish by year offset or counter name
  // To avoid collisions, we use a separate year key for receipts
  const receiptYearKey = -(year * 10 + 1); // Negative key ensures isolated sequence in same collection

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year: receiptYearKey },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = counter.lastSequence;
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
  const certYearKey = -(year * 10 + 2); // Negative key ensures isolated sequence

  const counter = await EnrollmentCounter.findOneAndUpdate(
    { year: certYearKey },
    { $inc: { lastSequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sequence = counter.lastSequence;
  const paddedSequence = String(sequence).padStart(5, "0");
  return `QPET-CERT-${year}-${paddedSequence}`;
}
