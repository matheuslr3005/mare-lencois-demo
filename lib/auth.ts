import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mare_admin";
const TTL_MS = 8 * 3600 * 1000;

const secret = () => process.env.SESSION_SECRET ?? "";
export const authConfigured = () => !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret().length >= 32);

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");
const digest = (s: string) => createHash("sha256").update(s).digest();

/** Compara em tempo constante (evita descobrir a senha pelo tempo de resposta). */
export function checkCredentials(email: string, password: string) {
  if (!authConfigured()) return false;
  const okEmail = timingSafeEqual(digest(email.trim().toLowerCase()), digest(process.env.ADMIN_EMAIL!.trim().toLowerCase()));
  const okPass = timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD!));
  return okEmail && okPass;
}

export function createSessionToken() {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token || !authConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(payload) > Date.now();
}

export async function isAdmin() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL_MS / 1000,
};

// Limite simples de tentativas por IP (em produção: Redis/Upstash ou o rate limit da hospedagem).
const attempts = new Map<string, { n: number; reset: number }>();
export function tooManyAttempts(ip: string) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) {
    attempts.set(ip, { n: 1, reset: now + 5 * 60_000 });
    return false;
  }
  a.n += 1;
  return a.n > 5;
}
export const clearAttempts = (ip: string) => attempts.delete(ip);
