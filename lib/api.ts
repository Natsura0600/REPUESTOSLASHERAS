import { NextResponse } from "next/server";
import { sesionActual } from "./auth";
import type { Rol } from "./types";

/** Envuelve un handler del panel: exige sesión (y opcionalmente rol admin) y devuelve errores legibles. */
export function protegido<A extends unknown[]>(
  handler: (rol: Rol, ...args: A) => Promise<Response>,
  soloAdmin = false
) {
  return async (...args: A) => {
    const rol = await sesionActual();
    if (!rol) return NextResponse.json({ error: "Sesión vencida. Volvé a ingresar." }, { status: 401 });
    if (soloAdmin && rol !== "admin")
      return NextResponse.json({ error: "Solo el dueño puede hacer esto." }, { status: 403 });
    try {
      return await handler(rol, ...args);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message || "Error inesperado" }, { status: 500 });
    }
  };
}
