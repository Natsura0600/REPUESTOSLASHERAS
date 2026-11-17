/**
 * Capa de datos SIN base de datos, preparada para ~30.000+ artículos.
 *
 * Dónde viven los datos
 * ---------------------
 *   data/config.json            datos del local
 *   data/plano.json             plano y pasillos
 *   data/productos/p-XX.json    catálogo partido en 128 archivos ("fragmentos")
 *   data/img/*.webp             fotos
 *
 * Cada producto va siempre al mismo fragmento (según su id), así un cambio de
 * stock reescribe UN archivo de ~100 KB y no el catálogo entero.
 *
 * Producción (Vercel + GITHUB_TOKEN):
 *   - Al arrancar se usa la copia de /data que viene dentro del deploy.
 *   - Cada pocos segundos se pregunta a GitHub qué archivos cambiaron
 *     (1 sola llamada si no cambió nada) y se descargan solo esos.
 *   - Al guardar se hace UN commit con todos los archivos tocados (API de Git).
 *     Si dos personas guardan a la vez, se re-sincroniza y se reintenta.
 *
 * Desarrollo local (sin token): se lee y escribe directo en la carpeta /data.
 */
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Config, Plano, Producto } from "./types";

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
export const usaGitHub = Boolean(TOKEN && REPO);

export const FRAGMENTOS = 128;
const TTL = 10_000; // cada cuánto se consulta a GitHub si hubo cambios (ms)

// ---------------------------------------------------------------- utilidades
const DATA = (...p: string[]) => path.join(process.cwd(), "data", ...p);

function shaGit(buf: Buffer) {
  return createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
}

/** Fragmento fijo para cada id (FNV-1a). */
export function fragmentoDe(id: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `p-${((h >>> 0) % FRAGMENTOS).toString(16).padStart(2, "0")}.json`;
}

/** Un producto por línea: liviano y con diffs legibles en GitHub. */
function serializarFragmento(lista: Producto[]) {
  if (!lista.length) return "[]\n";
  return "[\n" + lista.map((p) => JSON.stringify(p)).join(",\n") + "\n]\n";
}

function gh(url: string, init: RequestInit = {}) {
  return fetch(`${process.env.GITHUB_API_URL || "https://api.github.com"}/repos/${REPO}/${url}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "repuestos-las-heras-panel",
      Accept: "application/vnd.github+json",
      ...(init.headers || {}),
    },
  });
}

async function ghJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await gh(url, init);
  if (!r.ok) {
    const e = new Error(`GitHub respondió ${r.status} (${url.split("?")[0]})`) as Error & { status?: number };
    e.status = r.status;
    throw e;
  }
  return r.json() as Promise<T>;
}

async function leerRemoto(ruta: string): Promise<Buffer> {
  const r = await gh(`contents/${ruta}?ref=${encodeURIComponent(BRANCH)}`, {
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!r.ok) throw new Error(`GitHub respondió ${r.status} al leer ${ruta}`);
  return Buffer.from(await r.arrayBuffer());
}

type Entrada = { name: string; sha: string; type: string };

async function listarRemoto(ruta: string): Promise<Entrada[]> {
  return ghJSON<Entrada[]>(`contents/${ruta}?ref=${encodeURIComponent(BRANCH)}`);
}

async function listarLocal(dir: string): Promise<Entrada[]> {
  const nombres = await fs.readdir(DATA(dir)).catch(() => [] as string[]);
  const out: Entrada[] = [];
  for (const n of nombres) {
    if (!n.endsWith(".json")) continue;
    const buf = await fs.readFile(DATA(dir, n));
    out.push({ name: n, sha: shaGit(buf), type: "file" });
  }
  return out;
}

async function enParalelo<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const res: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        res[k] = await fn(items[k]);
      }
    })
  );
  return res;
}

// ---------------------------------------------------------------- estado en memoria
interface Estado {
  version: number;
  config: Config;
  plano: Plano;
  fragmentos: Map<string, Producto[]>;
  shas: Map<string, string>; // ruta relativa a data/ -> sha del blob
  shaDirProductos: string;
  shaRaiz: { config: string; plano: string };
  todos: Producto[] | null; // lista aplanada (se arma bajo demanda)
  sincronizado: number;
}

let estado: Estado | null = null;
let cargando: Promise<Estado> | null = null;

async function cargarDesdeDisco(): Promise<Estado> {
  const config = JSON.parse(await fs.readFile(DATA("config.json"), "utf8")) as Config;
  const plano = JSON.parse(await fs.readFile(DATA("plano.json"), "utf8")) as Plano;
  const fragmentos = new Map<string, Producto[]>();
  const shas = new Map<string, string>();
  const nombres = (await fs.readdir(DATA("productos")).catch(() => [] as string[])).filter((n) => n.endsWith(".json"));
  for (const n of nombres) {
    const buf = await fs.readFile(DATA("productos", n));
    fragmentos.set(n, JSON.parse(buf.toString("utf8")));
    shas.set(`productos/${n}`, shaGit(buf));
  }
  shas.set("config.json", shaGit(Buffer.from(JSON.stringify(config))));
  return {
    version: 1, config, plano, fragmentos, shas, shaDirProductos: "", shaRaiz: { config: "", plano: "" },
    todos: null, sincronizado: 0,
  };
}

/** Trae de GitHub solo lo que cambió desde la última vez. */
async function sincronizarGitHub(e: Estado) {
  const raiz = await listarRemoto("data");
  let cambios = false;
  for (const ent of raiz) {
    if (ent.name === "config.json" && ent.sha !== e.shaRaiz.config) {
      e.config = JSON.parse((await leerRemoto("data/config.json")).toString("utf8"));
      e.shaRaiz.config = ent.sha;
      cambios = true;
    }
    if (ent.name === "plano.json" && ent.sha !== e.shaRaiz.plano) {
      e.plano = JSON.parse((await leerRemoto("data/plano.json")).toString("utf8"));
      e.shaRaiz.plano = ent.sha;
      cambios = true;
    }
    if (ent.name === "productos" && ent.type === "dir" && ent.sha !== e.shaDirProductos) {
      const lista = await listarRemoto("data/productos");
      const remotos = new Set(lista.map((x) => x.name));
      const aBajar = lista.filter((x) => x.name.endsWith(".json") && e.shas.get(`productos/${x.name}`) !== x.sha);
      const bajados = await enParalelo(aBajar, 6, async (x) => [x, await leerRemoto(`data/productos/${x.name}`)] as const);
      for (const [x, buf] of bajados) {
        e.fragmentos.set(x.name, JSON.parse(buf.toString("utf8")));
        e.shas.set(`productos/${x.name}`, x.sha);
      }
      for (const n of [...e.fragmentos.keys()]) if (!remotos.has(n)) e.fragmentos.delete(n);
      e.shaDirProductos = ent.sha;
      if (bajados.length) cambios = true;
    }
  }
  if (cambios) {
    e.version++;
    e.todos = null;
  }
}

async function obtenerEstado(fresco = false): Promise<Estado> {
  if (!estado) {
    cargando ??= cargarDesdeDisco().then((e) => (estado = e));
    await cargando;
  }
  const e = estado!;
  if (fresco || Date.now() - e.sincronizado > TTL) {
    e.sincronizado = Date.now();
    if (usaGitHub) {
      try {
        await sincronizarGitHub(e);
      } catch (err) {
        console.error("No se pudo sincronizar con GitHub, se usan los datos en memoria:", err);
        if (fresco) throw err;
      }
    } else if (!process.env.VERCEL) {
      // Desarrollo: releer el disco por si se editaron los archivos a mano
      const nuevo = await cargarDesdeDisco();
      nuevo.version = e.version + 1;
      nuevo.sincronizado = Date.now();
      estado = nuevo;
      return nuevo;
    }
  }
  return e;
}

// ---------------------------------------------------------------- escritura
type ArchivoNuevo = { ruta: string; contenido: Buffer | null }; // null = borrar

class Conflicto extends Error {}

async function commitGitHub(archivos: ArchivoNuevo[], mensaje: string) {
  const ref = await ghJSON<{ object: { sha: string } }>(`git/ref/heads/${encodeURIComponent(BRANCH)}`);
  const padre = ref.object.sha;
  const commitPadre = await ghJSON<{ tree: { sha: string } }>(`git/commits/${padre}`);
  // Los JSON van "inline" en el árbol (1 request aunque sean 128 archivos);
  // las imágenes, como blob aparte.
  let base = commitPadre.tree.sha;
  const lotes: ArchivoNuevo[][] = [];
  let actual: ArchivoNuevo[] = [];
  let peso = 0;
  for (const a of archivos) {
    const t = a.contenido?.length || 0;
    if (actual.length && peso + t > 6_000_000) {
      lotes.push(actual);
      actual = [];
      peso = 0;
    }
    actual.push(a);
    peso += t;
  }
  if (actual.length) lotes.push(actual);
  for (const lote of lotes) {
    const entradas = await Promise.all(
      lote.map(async (a) => {
        const p = `data/${a.ruta}`;
        if (a.contenido === null) return { path: p, mode: "100644", type: "blob", sha: null };
        if (a.ruta.endsWith(".json")) return { path: p, mode: "100644", type: "blob", content: a.contenido.toString("utf8") };
        const blob = await ghJSON<{ sha: string }>("git/blobs", {
          method: "POST",
          body: JSON.stringify({ content: a.contenido.toString("base64"), encoding: "base64" }),
        });
        return { path: p, mode: "100644", type: "blob", sha: blob.sha };
      })
    );
    const arbol = await ghJSON<{ sha: string }>("git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: base, tree: entradas }),
    });
    base = arbol.sha;
  }
  const nuevo = await ghJSON<{ sha: string }>("git/commits", {
    method: "POST",
    // [panel] hace que Vercel NO vuelva a publicar: el sitio lee los datos en vivo
    body: JSON.stringify({ message: `[panel] ${mensaje}`, tree: base, parents: [padre] }),
  });
  const r = await gh(`git/refs/heads/${encodeURIComponent(BRANCH)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: nuevo.sha, force: false }),
  });
  if (r.status === 422 || r.status === 409) throw new Conflicto("Otro cambio se guardó al mismo tiempo");
  if (!r.ok) throw new Error(`GitHub respondió ${r.status} al guardar`);
}

async function commitLocal(archivos: ArchivoNuevo[]) {
  for (const a of archivos) {
    const abs = DATA(...a.ruta.split("/"));
    if (a.contenido === null) await fs.unlink(abs).catch(() => {});
    else {
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, a.contenido);
    }
  }
}

async function guardar(archivos: ArchivoNuevo[], mensaje: string) {
  if (!archivos.length) return;
  if (usaGitHub) return commitGitHub(archivos, mensaje);
  if (process.env.VERCEL)
    throw new Error("Falta configurar GITHUB_TOKEN y GITHUB_REPO en Vercel: sin eso el panel no puede guardar cambios.");
  return commitLocal(archivos);
}

/** Transacción sobre el catálogo: solo se reescriben los fragmentos tocados. */
export interface Tx {
  get(id: string): Producto | undefined;
  put(p: Producto): void;
  del(id: string): void;
  todos(): Producto[];
}

export async function modificarCatalogo<R>(mensaje: string, fn: (tx: Tx) => R | Promise<R>): Promise<R> {
  for (let intento = 0; intento < 4; intento++) {
    const e = await obtenerEstado(true);
    const tocados = new Map<string, Producto[]>();
    const frag = (n: string) => {
      if (!tocados.has(n)) tocados.set(n, [...(e.fragmentos.get(n) || [])]);
      return tocados.get(n)!;
    };
    const tx: Tx = {
      get: (id) => (tocados.get(fragmentoDe(id)) || e.fragmentos.get(fragmentoDe(id)) || []).find((p) => p.id === id),
      put: (p) => {
        const l = frag(fragmentoDe(p.id));
        const i = l.findIndex((x) => x.id === p.id);
        if (i >= 0) l[i] = p;
        else l.push(p);
      },
      del: (id) => {
        const l = frag(fragmentoDe(id));
        const i = l.findIndex((x) => x.id === id);
        if (i >= 0) l.splice(i, 1);
      },
      todos: () => [...e.fragmentos.entries()].flatMap(([n, l]) => tocados.get(n) || l),
    };
    const resultado = await fn(tx);
    const archivos = [...tocados.entries()].map(([n, l]) => ({ ruta: `productos/${n}`, contenido: Buffer.from(serializarFragmento(l)) }));
    try {
      await guardar(archivos, mensaje);
    } catch (err) {
      if (err instanceof Conflicto && intento < 3) {
        await new Promise((r) => setTimeout(r, 300 * (intento + 1)));
        continue;
      }
      throw err;
    }
    for (const [n, l] of tocados) {
      e.fragmentos.set(n, l);
      e.shas.set(`productos/${n}`, shaGit(Buffer.from(serializarFragmento(l))));
    }
    e.version++;
    e.todos = null;
    return resultado;
  }
  throw new Error("No se pudo guardar, probá de nuevo.");
}

async function modificarArchivoRaiz<T>(archivo: "config.json" | "plano.json", mensaje: string, fn: (actual: T) => T): Promise<T> {
  for (let intento = 0; intento < 4; intento++) {
    const e = await obtenerEstado(true);
    const actual = (archivo === "config.json" ? e.config : e.plano) as T;
    const nuevo = fn(structuredClone(actual));
    try {
      await guardar([{ ruta: archivo, contenido: Buffer.from(JSON.stringify(nuevo, null, 2) + "\n") }], mensaje);
    } catch (err) {
      if (err instanceof Conflicto && intento < 3) continue;
      throw err;
    }
    if (archivo === "config.json") e.config = nuevo as Config;
    else e.plano = nuevo as Plano;
    e.version++;
    return nuevo;
  }
  throw new Error("No se pudo guardar, probá de nuevo.");
}

// ---------------------------------------------------------------- API pública
export async function getProductos(fresco = false): Promise<Producto[]> {
  const e = await obtenerEstado(fresco);
  if (!e.todos) e.todos = [...e.fragmentos.values()].flat();
  return e.todos;
}
export async function getProducto(id: string, fresco = false) {
  const e = await obtenerEstado(fresco);
  return (e.fragmentos.get(fragmentoDe(id)) || []).find((p) => p.id === id);
}
export const getPlano = async (fresco = false) => (await obtenerEstado(fresco)).plano;
export const getConfig = async (fresco = false) => (await obtenerEstado(fresco)).config;
/** Número que cambia cada vez que cambian los datos (para cachear cálculos). */
export const versionDatos = async () => (await obtenerEstado()).version;

export const modificarPlano = (msg: string, fn: (p: Plano) => Plano) => modificarArchivoRaiz<Plano>("plano.json", msg, fn);
export const modificarConfig = (msg: string, fn: (c: Config) => Config) => modificarArchivoRaiz<Config>("config.json", msg, fn);

// ---------------------------------------------------------------- imágenes
export async function leerImagen(nombre: string) {
  if (!/^[a-z0-9-]+\.(webp|jpg|jpeg|png)$/i.test(nombre)) return null;
  try {
    return await fs.readFile(DATA("img", nombre)); // las que ya venían en el deploy
  } catch {}
  if (!usaGitHub) return null;
  try {
    return await leerRemoto(`data/img/${nombre}`);
  } catch {
    return null;
  }
}

export async function guardarImagen(nombre: string, buf: Buffer) {
  await guardar([{ ruta: `img/${nombre}`, contenido: buf }], `imagen ${nombre}`);
}

export async function borrarImagen(nombre: string) {
  if (!nombre) return;
  try {
    await guardar([{ ruta: `img/${nombre}`, contenido: null }], `borrar imagen ${nombre}`);
  } catch {
    /* si no existe no pasa nada */
  }
}
