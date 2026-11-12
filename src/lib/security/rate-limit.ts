import { connectDB } from "@/lib/db/mongoose";
import { LoginAttempt } from "@/lib/models/LoginAttempt";

const MAX_ATTEMPTS_TIER_1 = 5; // 5 failed attempts = 5 min cooldown
const LOCK_TIME_TIER_1_MS = 5 * 60 * 1000;

const MAX_ATTEMPTS_TIER_2 = 10; // 10 failed attempts = 15 min cooldown
const LOCK_TIME_TIER_2_MS = 15 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  remainingSeconds?: number;
  error?: string;
}

/**
 * Checks if the IP or identifier is currently locked out due to excessive failed logins.
 */
export async function checkLoginRateLimit(
  ip: string,
  identifier?: string
): Promise<RateLimitResult> {
  try {
    await connectDB();
    const now = new Date();

    const keys = [`ip:${ip}`];
    if (identifier) {
      keys.push(`ident:${identifier.trim().toLowerCase()}`);
    }

    const lockedRecord = await LoginAttempt.findOne({
      key: { $in: keys },
      lockedUntil: { $gt: now },
    }).lean();

    if (lockedRecord && lockedRecord.lockedUntil) {
      const remainingSeconds = Math.ceil(
        (new Date(lockedRecord.lockedUntil).getTime() - now.getTime()) / 1000
      );
      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      return {
        allowed: false,
        remainingSeconds,
        error: `Too many failed login attempts. Your access is temporarily locked. Please try again in ${remainingMinutes} minute${
          remainingMinutes > 1 ? "s" : ""
        }.`,
      };
    }

    // Check for progressive delay if attempts > 2
    const attemptRecord = await LoginAttempt.findOne({
      key: { $in: keys },
    }).lean();

    if (attemptRecord && attemptRecord.failedAttempts > 2) {
      // Progressive delay to slow down automated dictionary attacks
      const delayMs = Math.min(attemptRecord.failedAttempts * 200, 1500);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return { allowed: true };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Non-blocking fallback in case of transient DB error
    return { allowed: true };
  }
}

/**
 * Records a failed login attempt for both IP and identifier.
 */
export async function recordLoginFailure(
  ip: string,
  identifier?: string
): Promise<void> {
  try {
    await connectDB();
    const now = new Date();

    const targets = [{ key: `ip:${ip}`, ip, identifier }];
    if (identifier) {
      targets.push({
        key: `ident:${identifier.trim().toLowerCase()}`,
        ip,
        identifier: identifier.trim().toLowerCase(),
      });
    }

    for (const target of targets) {
      const existing = await LoginAttempt.findOne({ key: target.key });

      if (existing) {
        existing.failedAttempts += 1;
        existing.lastAttempt = now;
        existing.createdAt = now; // Refresh TTL window

        if (existing.failedAttempts >= MAX_ATTEMPTS_TIER_2) {
          existing.lockedUntil = new Date(now.getTime() + LOCK_TIME_TIER_2_MS);
        } else if (existing.failedAttempts >= MAX_ATTEMPTS_TIER_1) {
          existing.lockedUntil = new Date(now.getTime() + LOCK_TIME_TIER_1_MS);
        }

        await existing.save();
      } else {
        await LoginAttempt.create({
          key: target.key,
          ip: target.ip,
          identifier: target.identifier,
          failedAttempts: 1,
          lastAttempt: now,
          createdAt: now,
        });
      }
    }
  } catch (err) {
    console.error("Failed to record login failure:", err);
  }
}

/**
 * Clears failed attempts upon a successful login.
 */
export async function recordLoginSuccess(
  ip: string,
  identifier?: string
): Promise<void> {
  try {
    await connectDB();
    const keys = [`ip:${ip}`];
    if (identifier) {
      keys.push(`ident:${identifier.trim().toLowerCase()}`);
    }

    await LoginAttempt.deleteMany({ key: { $in: keys } });
  } catch (err) {
    console.error("Failed to clear rate limit after successful login:", err);
  }
}
