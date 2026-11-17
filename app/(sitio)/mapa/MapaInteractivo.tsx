"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Plano, { Leyenda } from "@/components/Plano";
import type { Plano as TPlano, Producto } from "@/lib/types";
import { STOCK_TXT } from "@/lib/util";

type Mini = Pick<Producto, "id" | "nombre" | "marca" | "estante" | "lado" | "stock">;

export default function MapaInteractivo({ plano, conteo, inicial, productoInicial }: {
  plano: TPlano; conteo: Record<string, number>; inicial: string | null;
  productoInicial: { id: string; zonaId: string; estante: number | null } | null;
}) {
  const pi = productoInicial;
  const [zona, setZona] = useState<string | null>(pi?.zonaId || inicial || plano.zonas.find((z) => z.tipo === "pasillo")?.id || null);
  const [filtro, setFiltro] = useState("");
  const [estante, setEstante] = useState<number | null>(null);
  const [datos, setDatos] = useState<{ total: number; items: Mini[] } | null>(null);
  const [cargando, setCargando] = useState(false);
  const z = plano.zonas.find((x) => x.id === zona);

  useEffect(() => setEstante(null), [zona]);
  useEffect(() => {
    if (!zona) return;
    const ctrl = new AbortController();
    setCargando(true);
    const t = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({ zona, q: filtro, ...(estante ? { estante: String(estante) } : {}) });
        const r = await fetch(`/api/zona?${qs}`, { signal: ctrl.signal });
        setDatos(await r.json());
      } catch {}
      setCargando(false);
    }, filtro ? 200 : 0);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [zona, filtro, estante]);

  return (
    <div className="mapa-layout">
      <div>
        <div className="plano-wrap">
          <Plano plano={plano} resaltar={zona} estante={pi && pi.zonaId === zona ? pi.estante : estante} conteo={conteo}
            onZona={(x) => x.tipo !== "entrada" && x.tipo !== "deposito" && setZona(x.id)} />
        </div>
        <Leyenda plano={plano} />
      </div>
      <aside className="mapa-panel">
        {z ? (
          <>
            <div className="mapa-panel-cab">
              <span className="cartel" style={{ ["--zc" as string]: z.color }}>
                <span className="c">{z.codigo || "•"}</span><span className="t">{(conteo[z.id] || 0).toLocaleString("es-AR")} artículos</span>
              </span>
              <h2>{z.nombre}</h2>
              <p className="muted" style={{ margin: "0 0 12px", fontSize: 14 }}>{z.descripcion}</p>
              <input className="input" placeholder="Buscar en este sector…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
              {z.estantes > 1 && (
                <div className="chips" style={{ marginTop: 10 }}>
                  <button className={`chip ${!estante ? "on" : ""}`} onClick={() => setEstante(null)}>Todos</button>
                  {Array.from({ length: z.estantes }).map((_, i) => (
                    <button key={i} className={`chip ${estante === i + 1 ? "on" : ""}`} onClick={() => setEstante(i + 1)}>Est. {i + 1}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="mapa-panel-lista" style={{ opacity: cargando ? 0.5 : 1, transition: "opacity .2s" }}>
              {datos && datos.items.length === 0 && <p className="muted" style={{ padding: 20 }}>No hay productos cargados acá.</p>}
              {datos?.items.map((p) => (
                <Link key={p.id} href={`/producto/${p.id}`} className="mp-item" style={p.id === pi?.id ? { background: "var(--rojo-claro)" } : undefined}>
                  <b>{p.nombre}</b>
                  <small>{p.marca} · {STOCK_TXT[p.stock]}</small>
                  <span className="est">{p.estante ? `Est. ${p.estante}${p.lado ? (p.lado === "izq" ? " · Izq" : " · Der") : ""}` : "—"}</span>
                </Link>
              ))}
              {datos && datos.total > datos.items.length && (
                <p className="muted" style={{ padding: "12px 20px", fontSize: 13 }}>
                  Mostrando {datos.items.length} de {datos.total.toLocaleString("es-AR")}. Buscá o elegí un estante para acotar, o <Link href={`/catalogo?zona=${zona}`}>miralos en el catálogo</Link>.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="muted" style={{ padding: 20 }}>Elegí un sector en el plano.</p>
        )}
      </aside>
    </div>
  );
}
