import { getConfig, getPlano, getProductos, versionDatos } from "./store";
import type { Producto, Zona } from "./types";
import { buscar } from "./util";

// Cálculos sobre el catálogo completo (conteos, orden alfabético) cacheados por versión de datos
let cache: { v: number; porNombre: Producto[]; conteoZona: Record<string, number>; conteoCat: Record<string, number>; destacados: Producto[]; marcas: string[] } | null = null;

async function derivados() {
  const v = await versionDatos();
  if (cache?.v === v) return cache;
  const productos = await getProductos();
  const conteoZona: Record<string, number> = {};
  const conteoCat: Record<string, number> = {};
  const marcas = new Set<string>();
  for (const p of productos) {
    conteoZona[p.zonaId] = (conteoZona[p.zonaId] || 0) + 1;
    conteoCat[p.categoria] = (conteoCat[p.categoria] || 0) + 1;
    if (p.marca) marcas.add(p.marca);
  }
  const porNombre = [...productos].sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
  const destacados = productos.filter((p) => p.destacado && p.stock !== "sin").slice(0, 8);
  cache = { v, porNombre, conteoZona, conteoCat, destacados, marcas: [...marcas].sort() };
  return cache;
}

export async function datosSitio() {
  const [plano, config, d, productos] = await Promise.all([getPlano(), getConfig(), derivados(), getProductos()]);
  const zonas: Record<string, Zona> = Object.fromEntries(plano.zonas.map((z) => [z.id, z]));
  return { plano, config, zonas, conteo: d.conteoZona, conteoCat: d.conteoCat, destacados: d.destacados, marcas: d.marcas, total: productos.length };
}

export interface Filtros {
  q?: string;
  cat?: string;
  zona?: string;
  stock?: string; // "si" = con stock, o un estado puntual
  falta?: string; // "ubicacion" | "foto"
  orden?: string;
  pag?: number;
  porPag?: number;
}

/** Filtra y pagina en el servidor: el navegador nunca recibe los 30.000 artículos. */
export async function consultar(f: Filtros, fresco = false) {
  const productos = await getProductos(fresco);
  let lista = f.q ? buscar(productos, f.q) : fresco ? productos : (await derivados()).porNombre;
  const filtrar = (fn: (p: Producto) => boolean) => (lista = lista.filter(fn));
  // conteo por rubro con los demás filtros aplicados excepto el rubro
  if (f.zona) filtrar((p) => p.zonaId === f.zona);
  if (f.stock === "si") filtrar((p) => p.stock === "disponible" || p.stock === "pocas");
  else if (f.stock) filtrar((p) => p.stock === f.stock);
  if (f.falta === "ubicacion") filtrar((p) => !p.zonaId);
  if (f.falta === "foto") filtrar((p) => !p.imagen);
  const porCat: Record<string, number> = {};
  for (const p of lista) porCat[p.categoria] = (porCat[p.categoria] || 0) + 1;
  const sinCat = lista.length;
  if (f.cat) filtrar((p) => p.categoria === f.cat);
  if (f.orden === "precio-asc") lista = [...lista].sort((a, b) => (a.precio ?? 1e12) - (b.precio ?? 1e12));
  if (f.orden === "precio-desc") lista = [...lista].sort((a, b) => (b.precio ?? -1) - (a.precio ?? -1));
  if (f.orden === "estante") lista = [...lista].sort((a, b) => (b.estante || 0) - (a.estante || 0));
  if (f.orden === "recientes") lista = [...lista].sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const porPag = f.porPag || 24;
  const paginas = Math.max(1, Math.ceil(lista.length / porPag));
  const pag = Math.min(Math.max(1, f.pag || 1), paginas);
  return { total: lista.length, totalSinRubro: sinCat, porCat, pag, paginas, items: lista.slice((pag - 1) * porPag, pag * porPag) };
}
