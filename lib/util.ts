import type { Config, Producto, Rango, Stock } from "./types";

export const STOCK_TXT: Record<Stock, string> = {
  disponible: "En stock",
  pocas: "Últimas unidades",
  consultar: "Consultar",
  sin: "Sin stock",
};

export function normalizar(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .trim();
}

// Texto normalizado de cada producto, calculado una sola vez (los objetos se
// reemplazan al editarse, así que la caché se invalida sola).
const indice = new WeakMap<Producto, { nombre: string; todo: string; codigo: string }>();
function textoDe(p: Producto) {
  let t = indice.get(p);
  if (!t) {
    t = {
      nombre: normalizar(p.nombre),
      todo: normalizar([p.nombre, p.marca, p.codigo, p.categoria, p.compatibilidad, p.descripcion].join(" ")),
      codigo: normalizar(p.codigo).replace(/ /g, ""),
    };
    indice.set(p, t);
  }
  return t;
}

/** Búsqueda tolerante: todas las palabras tienen que aparecer en algún campo. */
export function buscar(productos: Producto[], q: string) {
  const palabras = normalizar(q).split(/\s+/).filter(Boolean);
  if (!palabras.length) return productos;
  const juntas = palabras.join("");
  const out: { p: Producto; score: number }[] = [];
  for (const p of productos) {
    const t = textoDe(p);
    let score = 0;
    let ok = true;
    for (const w of palabras) {
      if (!t.todo.includes(w)) {
        ok = false;
        break;
      }
      score += t.nombre.startsWith(w) ? 3 : t.nombre.includes(w) ? 2 : 1;
    }
    if (!ok) {
      // permite buscar códigos escritos sin espacios ni guiones ("w71275")
      if (juntas.length >= 4 && t.codigo.includes(juntas)) score = 4;
      else continue;
    }
    if (t.codigo === juntas) score += 6;
    if (p.stock === "sin") score -= 1;
    out.push({ p, score });
  }
  return out.sort((a, b) => b.score - a.score).map((x) => x.p);
}

export function precioTxt(p: Pick<Producto, "precio" | "mostrarPrecio">) {
  if (!p.mostrarPrecio || p.precio == null) return null;
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    p.precio
  );
}

export function slug(s: string) {
  return normalizar(s).replace(/\s+/g, "-").slice(0, 60);
}

export function nuevoId(nombre: string) {
  return `${slug(nombre) || "producto"}-${Date.now().toString(36).slice(-5)}`;
}

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function ahoraArgentina() {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => f.find((x) => x.type === t)?.value || "";
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const h = Number(get("hour")) % 24;
  return { dia: wd, min: h * 60 + Number(get("minute")), fecha: `${get("year")}-${get("month")}-${get("day")}` };
}

const aMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
};

export function estadoLocal(config: Config): { abierto: boolean; texto: string } {
  const { dia, min, fecha } = ahoraArgentina();
  const feriado = config.feriados?.includes(fecha);
  const hoy: Rango[] = feriado ? [] : config.horarios[String(dia)] || [];
  for (const r of hoy) {
    if (min >= aMin(r.desde) && min < aMin(r.hasta)) {
      const faltan = aMin(r.hasta) - min;
      return {
        abierto: true,
        texto: faltan <= 30 ? `Abierto · cierra en ${faltan} min` : `Abierto hasta las ${r.hasta}`,
      };
    }
  }
  const prox = hoy.find((r) => aMin(r.desde) > min);
  if (prox) return { abierto: false, texto: `Cerrado · abre hoy ${prox.desde}` };
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    const rs = config.horarios[String(d)] || [];
    if (rs.length) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? "mañana" : DIAS[d].toLowerCase()} ${rs[0].desde}` };
  }
  return { abierto: false, texto: "Cerrado" };
}

export function horarioResumen(config: Config) {
  // Agrupa días consecutivos con el mismo horario: "Lun a Vie 8 a 12:30 / 14:30 a 19"
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const corto = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const txt = (rs: Rango[]) => rs.map((r) => `${r.desde} a ${r.hasta}`).join(" / ");
  const grupos: { dias: number[]; t: string }[] = [];
  for (const d of orden) {
    const t = txt(config.horarios[String(d)] || []) || "Cerrado";
    const g = grupos[grupos.length - 1];
    if (g && g.t === t) g.dias.push(d);
    else grupos.push({ dias: [d], t });
  }
  return grupos.map((g) => ({
    dias: g.dias.length > 1 ? `${corto[g.dias[0]]} a ${corto[g.dias[g.dias.length - 1]]}` : corto[g.dias[0]],
    horario: g.t,
  }));
}

export function waLink(numero: string, texto: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function ubicacionTxt(p: Producto, zonaNombre?: string) {
  const partes = [zonaNombre || ""];
  if (p.estante) partes.push(`estante ${p.estante}`);
  if (p.lado) partes.push(p.lado === "izq" ? "lado izquierdo" : "lado derecho");
  return partes.filter(Boolean).join(" · ");
}
