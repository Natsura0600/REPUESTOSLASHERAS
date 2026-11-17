import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { aCSV, leerCSV } from "@/lib/csv";
import { getPlano, getProductos, modificarCatalogo } from "@/lib/store";
import type { Producto, Stock } from "@/lib/types";
import { normalizar, nuevoId } from "@/lib/util";

const COLS = ["id", "nombre", "marca", "codigo", "categoria", "compatibilidad", "descripcion", "precio", "mostrar_precio", "stock", "pasillo", "estante", "lado", "nota", "destacado"];

export const GET = protegido(async () => {
  const [productos, plano] = await Promise.all([getProductos(true), getPlano(true)]);
  const cod = Object.fromEntries(plano.zonas.map((z) => [z.id, z.codigo || z.id]));
  const filas = [COLS, ...productos.map((p) => [
    p.id, p.nombre, p.marca, p.codigo, p.categoria, p.compatibilidad, p.descripcion, p.precio, p.mostrarPrecio ? "si" : "no",
    p.stock, cod[p.zonaId] || "", p.estante, p.lado, p.nota, p.destacado ? "si" : "no",
  ])];
  return new Response(aCSV(filas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="productos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

export const POST = protegido(async (_rol, req: Request) => {
  const texto = await req.text();
  const filas = leerCSV(texto);
  if (filas.length < 2) throw new Error("El archivo está vacío o no tiene encabezados.");
  const cab = filas[0].map((h) => normalizar(h).replace(/ /g, "_"));
  const idx = (n: string) => cab.indexOf(n);
  if (idx("nombre") < 0) throw new Error('Falta la columna "nombre". Descargá la planilla modelo desde el panel.');
  const plano = await getPlano(true);
  const zonaPorCodigo = Object.fromEntries(plano.zonas.flatMap((z) => [[normalizar(z.codigo), z.id], [normalizar(z.id), z.id]]));
  const si = (v: string) => ["si", "sí", "s", "1", "true", "x"].includes(normalizar(v));
  const stocks: Stock[] = ["disponible", "pocas", "consultar", "sin"];
  let creados = 0, actualizados = 0;
  const ahora = new Date().toISOString();

  await modificarCatalogo(`importar planilla (${filas.length - 1} filas)`, (tx) => {
    creados = 0;
    actualizados = 0;
    const porCodigo = new Map<string, Producto>();
    for (const p of tx.todos()) if (p.codigo) porCodigo.set(normalizar(p.marca + " " + p.codigo), p);
    for (const f of filas.slice(1)) {
      const g = (n: string) => (idx(n) >= 0 ? (f[idx(n)] || "").trim() : "");
      const nombre = g("nombre");
      if (!nombre) continue;
      const precioTxt = g("precio").replace(/[$\s.]/g, "").replace(",", ".");
      const st = normalizar(g("stock"));
      const datos: Omit<Producto, "id" | "imagen"> = {
        nombre: nombre.slice(0, 120),
        marca: g("marca").slice(0, 60),
        codigo: g("codigo").slice(0, 60),
        categoria: g("categoria") || "Otros",
        compatibilidad: g("compatibilidad").slice(0, 400),
        descripcion: g("descripcion").slice(0, 1500),
        precio: precioTxt && isFinite(Number(precioTxt)) ? Math.round(Number(precioTxt)) : null,
        mostrarPrecio: idx("mostrar_precio") >= 0 ? si(g("mostrar_precio")) : Boolean(precioTxt),
        stock: (stocks.find((s) => s === st) || (st === "no" || st === "0" ? "sin" : "disponible")) as Stock,
        zonaId: zonaPorCodigo[normalizar(g("pasillo"))] || "",
        estante: Number(g("estante")) || null,
        lado: (["izq", "der"].includes(normalizar(g("lado"))) ? normalizar(g("lado")) : "") as Producto["lado"],
        nota: g("nota").slice(0, 200),
        destacado: si(g("destacado")),
        actualizado: ahora,
      };
      const clave = datos.codigo ? normalizar(datos.marca + " " + datos.codigo) : "";
      const previo = (g("id") && tx.get(g("id"))) || (clave ? porCodigo.get(clave) : undefined);
      if (previo) {
        const p = { ...previo, ...datos };
        tx.put(p);
        if (clave) porCodigo.set(clave, p);
        actualizados++;
      } else {
        const p: Producto = { ...datos, id: `${nuevoId(nombre)}${creados.toString(36)}`, imagen: "" };
        tx.put(p);
        if (clave) porCodigo.set(clave, p);
        creados++;
      }
    }
  });
  return NextResponse.json({ creados, actualizados });
});
