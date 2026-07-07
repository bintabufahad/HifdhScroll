import { createHmac, timingSafeEqual } from "crypto";

export const TRIAL_COOKIE_NAME = "hifdh_trial";

const SECRET = process.env.WAITLIST_COOKIE_SECRET ?? "dev-only-insecure-secret";

export interface TrialPayload {
  email: string;
  trialEndsAt: string;
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

/** Packs the payload with an HMAC signature so a user can't edit their own cookie to extend the trial. */
export function encodeTrialCookie(payload: TrialPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodeTrialCookie(value: string | undefined | null): TrialPayload | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TrialPayload;
  } catch {
    return null;
  }
}

export function isTrialActive(payload: TrialPayload | null): boolean {
  return !!payload && new Date(payload.trialEndsAt).getTime() > Date.now();
}
