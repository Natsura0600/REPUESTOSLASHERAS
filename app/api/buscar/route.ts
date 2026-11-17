import { NextResponse } from "next/server";
import { getPlano, getProductos } from "@/lib/store";
import { buscar } from "@/lib/util";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const [productos, plano] = await Promise.all([getProductos(), getPlano()]);
  const r = buscar(productos, q);
  const zonas = Object.fromEntries(plano.zonas.map((z) => [z.id, z]));
  return NextResponse.json({
    total: r.length,
    resultados: r.slice(0, 7).map((p) => {
      const z = zonas[p.zonaId];
      return {
        id: p.id, nombre: p.nombre, marca: p.marca, compatibilidad: p.compatibilidad, estante: p.estante,
        zona: z ? { codigo: z.codigo, color: z.color, nombre: z.nombre } : null,
      };
    }),
  });
}
