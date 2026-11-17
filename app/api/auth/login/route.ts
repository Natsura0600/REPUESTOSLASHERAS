import { NextResponse } from "next/server";
import { COOKIE, crearToken, rolPorPassword } from "@/lib/auth";

const intentos = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const reg = intentos.get(ip);
  if (reg && reg.n >= 6 && Date.now() - reg.t < 5 * 60_000) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá 5 minutos." }, { status: 429 });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Falta configurar ADMIN_PASSWORD en las variables de entorno." }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  const rol = rolPorPassword(String(password || ""));
  if (!rol) {
    intentos.set(ip, { n: (reg && Date.now() - reg.t < 5 * 60_000 ? reg.n : 0) + 1, t: Date.now() });
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  intentos.delete(ip);
  const { token, maxAge } = await crearToken(rol);
  const res = NextResponse.json({ ok: true, rol });
  res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
  return res;
}
