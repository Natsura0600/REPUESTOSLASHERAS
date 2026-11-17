import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { modificarPlano } from "@/lib/store";
import type { Plano } from "@/lib/types";

export const PUT = protegido(async (_rol, req: Request) => {
  const plano = (await req.json()) as Plano;
  if (!Array.isArray(plano.zonas)) throw new Error("Plano inválido");
  const limpio: Plano = {
    ancho: Math.min(Math.max(Number(plano.ancho) || 32, 10), 80),
    alto: Math.min(Math.max(Number(plano.alto) || 22, 8), 60),
    zonas: plano.zonas.map((z) => ({
      id: String(z.id).slice(0, 60),
      tipo: z.tipo,
      codigo: String(z.codigo || "").slice(0, 3).toUpperCase(),
      nombre: String(z.nombre || "").slice(0, 80),
      descripcion: String(z.descripcion || "").slice(0, 300),
      x: Number(z.x) || 0, y: Number(z.y) || 0, w: Math.max(Number(z.w) || 1, 1), h: Math.max(Number(z.h) || 1, 1),
      estantes: Math.min(Math.max(Number(z.estantes) || 0, 0), 12),
      color: /^#[0-9a-f]{6}$/i.test(z.color) ? z.color : "#555555",
    })),
  };
  return NextResponse.json(await modificarPlano("actualizar plano del local", () => limpio));
}, true);
