import { cookies } from "next/headers";
import type { Rol } from "./types";

export const COOKIE = "rlh_sesion";
const DURACION = 60 * 60 * 12; // 12 horas

function secreto() {
  const s = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Falta configurar ADMIN_PASSWORD / AUTH_SECRET");
  return s;
}

async function firmar(texto: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(texto));
  return Buffer.from(sig).toString("base64url");
}

function igualSeguro(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function rolPorPassword(pass: string): Rol | null {
  const admin = process.env.ADMIN_PASSWORD;
  const emp = process.env.EMPLEADOS_PASSWORD;
  if (admin && igualSeguro(pass, admin)) return "admin";
  if (emp && igualSeguro(pass, emp)) return "empleado";
  return null;
}

export async function crearToken(rol: Rol) {
  const exp = Math.floor(Date.now() / 1000) + DURACION;
  const base = `${rol}.${exp}`;
  return { token: `${base}.${await firmar(base)}`, maxAge: DURACION };
}

export async function verificarToken(token?: string): Promise<Rol | null> {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [rol, exp, sig] = partes;
  if (rol !== "admin" && rol !== "empleado") return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const esperado = await firmar(`${rol}.${exp}`);
  return igualSeguro(sig, esperado) ? (rol as Rol) : null;
}

export async function sesionActual(): Promise<Rol | null> {
  const c = await cookies();
  return verificarToken(c.get(COOKIE)?.value);
}
