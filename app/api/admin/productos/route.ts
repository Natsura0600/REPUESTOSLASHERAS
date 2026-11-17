import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { consultar } from "@/lib/datos";
import { borrarImagen, modificarCatalogo } from "@/lib/store";
import type { Producto, Stock } from "@/lib/types";
import { nuevoId } from "@/lib/util";

const STOCKS: Stock[] = ["disponible", "pocas", "consultar", "sin"];

function limpiar(d: Partial<Producto>, previo?: Producto): Producto {
  const s = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
  const precio = d.precio === null || d.precio === undefined || (d.precio as unknown) === "" ? null : Number(d.precio);
  const estante = d.estante === null || d.estante === undefined || (d.estante as unknown) === "" ? null : Number(d.estante);
  const nombre = s(d.nombre, 120);
  if (!nombre) throw new Error("El producto necesita un nombre.");
  return {
    id: previo?.id || nuevoId(nombre),
    nombre,
    marca: s(d.marca, 60),
    codigo: s(d.codigo, 60),
    categoria: s(d.categoria, 60) || "Otros",
    compatibilidad: s(d.compatibilidad, 400),
    descripcion: s(d.descripcion, 1500),
    precio: precio != null && isFinite(precio) && precio >= 0 ? Math.round(precio) : null,
    mostrarPrecio: Boolean(d.mostrarPrecio),
    stock: STOCKS.includes(d.stock as Stock) ? (d.stock as Stock) : "disponible",
    zonaId: s(d.zonaId, 60),
    estante: estante != null && isFinite(estante) && estante > 0 ? Math.round(estante) : null,
    lado: d.lado === "izq" || d.lado === "der" ? d.lado : "",
    nota: s(d.nota, 200),
    imagen: s(d.imagen, 100),
    destacado: Boolean(d.destacado),
    actualizado: new Date().toISOString(),
  };
}

// Lista paginada y filtrada para el panel
export const GET = protegido(async (_rol, req: Request) => {
  const sp = new URL(req.url).searchParams;
  const r = await consultar(
    {
      q: sp.get("q") || "", cat: sp.get("cat") || "", zona: sp.get("zona") || "", stock: sp.get("stock") || "",
      falta: sp.get("falta") || "", orden: sp.get("orden") || (sp.get("q") ? "" : "recientes"), pag: Number(sp.get("pag")) || 1, porPag: 50,
    },
    true
  );
  return NextResponse.json({ total: r.total, pag: r.pag, paginas: r.paginas, items: r.items });
});

// Crear o editar (si viene id existente). También acepta "parche" para cambios rápidos (stock/precio).
export const POST = protegido(async (_rol, req: Request) => {
  const body = await req.json();
  let imagenVieja = "";
  const guardado = await modificarCatalogo(
    body.parche ? `stock/precio ${body.id}` : body.id ? `editar ${body.nombre}` : `nuevo ${body.nombre}`,
    (tx) => {
      const previo = body.id ? tx.get(body.id) : undefined;
      if (body.parche) {
        if (!previo) throw new Error("No existe el producto (¿lo borró otra persona?)");
        const p = limpiar({ ...previo, ...body.parche }, previo);
        tx.put(p);
        return p;
      }
      if (previo?.imagen && previo.imagen !== body.imagen) imagenVieja = previo.imagen;
      const p = previo ? limpiar(body, previo) : limpiar({ ...body, id: undefined });
      tx.put(p);
      return p;
    }
  );
  if (imagenVieja) await borrarImagen(imagenVieja);
  return NextResponse.json(guardado);
});

export const DELETE = protegido(async (_rol, req: Request) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  const img = await modificarCatalogo(`borrar ${id}`, (tx) => {
    const p = tx.get(id);
    tx.del(id);
    return p?.imagen || "";
  });
  if (img) await borrarImagen(img);
  return NextResponse.json({ ok: true });
}, true);
