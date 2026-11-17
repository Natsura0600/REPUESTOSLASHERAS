import { NextResponse } from "next/server";
import { consultar } from "@/lib/datos";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const estante = Number(sp.get("estante")) || null;
  const r = await consultar({ zona: sp.get("zona") || "__", q: sp.get("q") || "", orden: sp.get("q") ? undefined : "estante", porPag: estante ? 100000 : 150 });
  let items = r.items;
  let total = r.total;
  if (estante) {
    items = items.filter((p) => p.estante === estante);
    total = items.length;
    items = items.slice(0, 150);
  }
  return NextResponse.json({
    total,
    items: items.map((p) => ({ id: p.id, nombre: p.nombre, marca: p.marca, estante: p.estante, lado: p.lado, stock: p.stock })),
  });
}
