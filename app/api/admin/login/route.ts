import { NextResponse } from "next/server";
import { SESSION_COOKIE, authConfigured, checkCredentials, clearAttempts, createSessionToken, sessionCookieOptions, tooManyAttempts } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Login não configurado (veja .env.example)." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 5 minutos." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 600)); // freia tentativa automatizada
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }
  clearAttempts(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
