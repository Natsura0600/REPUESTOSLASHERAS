"use client";
import { useCallback, useState } from "react";

export function useToast() {
  const [t, setT] = useState<{ msg: string; err?: boolean } | null>(null);
  const mostrar = useCallback((msg: string, err = false) => {
    setT({ msg, err });
    setTimeout(() => setT(null), err ? 6000 : 2600);
  }, []);
  const nodo = t ? <div className={`toast ${t.err ? "error" : ""}`}>{t.msg}</div> : null;
  return { mostrar, nodo };
}

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Sesión vencida");
  }
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`);
  return j as T;
}
