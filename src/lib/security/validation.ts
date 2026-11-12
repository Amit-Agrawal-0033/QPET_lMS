import mongoose from "mongoose";

/**
 * Validates whether a given string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/**
 * Validates email address format.
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates mobile phone number format (standard 10-15 digit phone numbers).
 */
export function isValidMobile(phone?: string | null): boolean {
  if (!phone || typeof phone !== "string") return false;
  const clean = phone.replace(/[\s\-\+\(\)]/g, "");
  return /^[0-9]{10,15}$/.test(clean);
}

/**
 * Validates password length and security bounds.
 */
export function validatePassword(password?: string | null): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must not exceed 128 characters." };
  }
  return { valid: true };
}

/**
 * Sanitizes input strings against XSS injection by escaping script tags and dangerous HTML characters.
 */
export function sanitizeString(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, (match) => (match === "<" ? "&lt;" : "&gt;"))
    .trim();
}

/**
 * Sanitizes and bounds pagination parameters to prevent Denial of Service via unbounded limits.
 */
export function sanitizePagination(
  rawPage?: any,
  rawLimit?: any,
  maxLimit: number = 200
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(String(rawPage), 10) || 1);
  const requestedLimit = parseInt(String(rawLimit), 10) || 50;
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Prevents mass assignment by picking only explicitly allowed keys from a user-supplied object.
 */
export function pickAllowedFields<T extends Record<string, any>>(
  source: T,
  allowedKeys: (keyof T | string)[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  if (!source || typeof source !== "object") return sanitized;

  for (const key of allowedKeys as string[]) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      sanitized[key as keyof T] = source[key];
    }
  }

  return sanitized;
}
