"use client";
import { useRef, useState } from "react";
import Icono from "@/components/Icono";
import type { Plano, TipoZona, Zona } from "@/lib/types";
import { api, useToast } from "../toast";

const COLORES = ["#B3261E", "#1F4E79", "#7A4E1D", "#2E5E3E", "#5B3B78", "#9A6A00", "#0F6E74", "#333333", "#555555", "#A34A7A"];
const TIPOS: [TipoZona, string][] = [["pasillo", "Pasillo / góndola"], ["exhibidor", "Exhibidor"], ["mostrador", "Mostrador"], ["caja", "Caja"], ["deposito", "Depósito"], ["entrada", "Entrada"]];
const snap = (v: number) => Math.round(v * 2) / 2;

export default function EditorPlano({ inicial, conteo }: { inicial: Plano; conteo: Record<string, number> }) {
  const [plano, setPlano] = useState<Plano>(inicial);
  const [sel, setSel] = useState<string | null>(inicial.zonas.find((z) => z.tipo === "pasillo")?.id || null);
  const [guardando, setGuardando] = useState(false);
  const [cambios, setCambios] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; modo: "mover" | "tam"; px: number; py: number; z: Zona } | null>(null);
  const { mostrar, nodo } = useToast();
  const z = plano.zonas.find((x) => x.id === sel);

  const pt = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const r = p.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };
  const actualizar = (id: string, c: Partial<Zona>) => {
    setPlano((pl) => ({ ...pl, zonas: pl.zonas.map((x) => (x.id === id ? { ...x, ...c } : x)) }));
    setCambios(true);
  };
  const down = (e: React.PointerEvent, zona: Zona, modo: "mover" | "tam") => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const { x, y } = pt(e);
    drag.current = { id: zona.id, modo, px: x, py: y, z: { ...zona } };
    setSel(zona.id);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const { x, y } = pt(e);
    const dx = x - d.px, dy = y - d.py;
    if (d.modo === "mover") {
      actualizar(d.id, {
        x: Math.max(0, Math.min(plano.ancho - d.z.w, snap(d.z.x + dx))),
        y: Math.max(0, Math.min(plano.alto - d.z.h, snap(d.z.y + dy))),
      });
    } else {
      actualizar(d.id, { w: Math.max(1, Math.min(plano.ancho - d.z.x, snap(d.z.w + dx))), h: Math.max(1, Math.min(plano.alto - d.z.y, snap(d.z.h + dy))) });
    }
  };
  const up = () => (drag.current = null);

  const agregar = () => {
    const usados = new Set(plano.zonas.map((x) => x.codigo));
    const letra = "ABCDEFGHIJKLMNOPQRSTUVWYZ".split("").find((l) => !usados.has(l)) || "";
    const nueva: Zona = { id: `pasillo-${letra.toLowerCase() || Date.now().toString(36)}-${Date.now().toString(36).slice(-3)}`, tipo: "pasillo", codigo: letra, nombre: `Pasillo ${letra} · Nuevo`, descripcion: "", x: 1, y: 1, w: 3, h: 8, estantes: 5, color: COLORES[plano.zonas.length % COLORES.length] };
    setPlano((pl) => ({ ...pl, zonas: [...pl.zonas, nueva] }));
    setSel(nueva.id);
    setCambios(true);
  };
  const borrar = () => {
    if (!z) return;
    const n = conteo[z.id] || 0;
    if (!confirm(n ? `"${z.nombre}" tiene ${n} productos asignados. Si lo borrás, esos productos quedan "sin ubicar". ¿Seguro?` : `¿Borrar "${z.nombre}"?`)) return;
    setPlano((pl) => ({ ...pl, zonas: pl.zonas.filter((x) => x.id !== z.id) }));
    setSel(null);
    setCambios(true);
  };
  const guardar = async () => {
    setGuardando(true);
    try {
      await api("/api/admin/plano", { method: "PUT", body: JSON.stringify(plano) });
      mostrar("Plano guardado ✓");
      setCambios(false);
    } catch (e) {
      mostrar((e as Error).message, true);
    }
    setGuardando(false);
  };

  return (
    <>
      <div className="adm-cab">
        <div>
          <h1>Plano del local</h1>
          <p>Arrastrá los sectores para moverlos. Usá la esquina inferior derecha para cambiar el tamaño.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-borde btn-chico" onClick={agregar}><Icono n="mas" s={16} /> Agregar sector</button>
          <button className="btn btn-rojo btn-chico" onClick={guardar} disabled={guardando || !cambios}>{guardando ? "Guardando…" : cambios ? "Guardar cambios" : "Guardado"}</button>
        </div>
      </div>
      <div className="editor-plano">
        <div className="panel" style={{ padding: 12 }}>
          <svg ref={svgRef} className="plano" viewBox={`-1 -1 ${plano.ancho + 2} ${plano.alto + 2}`} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerDown={() => setSel(null)}>
            <defs><pattern id="g2" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#e6dfd0" strokeWidth="0.05" /></pattern></defs>
            <rect x={0} y={0} width={plano.ancho} height={plano.alto} fill="url(#g2)" stroke="#1c1a17" strokeWidth="0.15" />
            {plano.zonas.map((zz) => (
              <g key={zz.id} className={`z ${sel === zz.id ? "sel" : ""}`}>
                <rect className="r" x={zz.x} y={zz.y} width={zz.w} height={zz.h} rx="0.15" fill={zz.tipo === "entrada" ? "#fff" : zz.color} fillOpacity={zz.tipo === "deposito" ? 0.35 : 0.88}
                  stroke="rgba(0,0,0,.3)" strokeWidth="0.06" style={{ cursor: "move" }} onPointerDown={(e) => down(e, zz, "mover")} />
                <text x={zz.x + zz.w / 2} y={zz.y + zz.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(1.4, zz.w * 0.5, zz.h * 0.7)} fill={zz.tipo === "entrada" || zz.tipo === "deposito" ? "#222" : "#fff"} fontWeight="700" pointerEvents="none">
                  {zz.codigo || zz.nombre.slice(0, 10)}
                </text>
                <rect x={zz.x + zz.w - 0.7} y={zz.y + zz.h - 0.7} width="0.7" height="0.7" fill="#fff" stroke="#000" strokeWidth="0.06" style={{ cursor: "nwse-resize" }} onPointerDown={(e) => down(e, zz, "tam")} />
              </g>
            ))}
          </svg>
          <div className="form-grid" style={{ marginTop: 12, maxWidth: 360 }}>
            <div className="campo"><label>Ancho del local (cuadros)</label><input type="number" min={10} max={80} value={plano.ancho} onChange={(e) => { setPlano({ ...plano, ancho: Number(e.target.value) || 10 }); setCambios(true); }} /></div>
            <div className="campo"><label>Largo del local (cuadros)</label><input type="number" min={8} max={60} value={plano.alto} onChange={(e) => { setPlano({ ...plano, alto: Number(e.target.value) || 8 }); setCambios(true); }} /></div>
          </div>
        </div>
        <div className="panel">
          {z ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ margin: 0 }}>{z.nombre || "Sector"}</h2>
              <span className="muted" style={{ fontSize: 13 }}>{conteo[z.id] || 0} productos asignados</span>
              <div className="campo"><label>Tipo</label><select value={z.tipo} onChange={(e) => actualizar(z.id, { tipo: e.target.value as TipoZona })}>{TIPOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
              <div className="form-grid">
                <div className="campo"><label>Letra / código</label><input maxLength={3} value={z.codigo} onChange={(e) => actualizar(z.id, { codigo: e.target.value.toUpperCase() })} /></div>
                <div className="campo"><label>Estantes</label><input type="number" min={0} max={12} value={z.estantes} onChange={(e) => actualizar(z.id, { estantes: Number(e.target.value) })} /></div>
              </div>
              <div className="campo"><label>Nombre</label><input value={z.nombre} onChange={(e) => actualizar(z.id, { nombre: e.target.value })} /><small>Para pasillos usá el formato “Pasillo A · Rubro”.</small></div>
              <div className="campo"><label>Descripción</label><textarea value={z.descripcion} onChange={(e) => actualizar(z.id, { descripcion: e.target.value })} /></div>
              <div className="campo">
                <label>Color</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COLORES.map((c) => (
                    <button key={c} type="button" onClick={() => actualizar(z.id, { color: c })} aria-label={c}
                      style={{ width: 28, height: 28, borderRadius: 6, background: c, border: z.color === c ? "3px solid #000" : "1px solid #ccc", cursor: "pointer" }} />
                  ))}
                  <input type="color" value={z.color} onChange={(e) => actualizar(z.id, { color: e.target.value })} style={{ width: 34, height: 30, padding: 0, border: 0 }} />
                </div>
              </div>
              <button className="btn btn-borde btn-chico" onClick={borrar} style={{ color: "var(--rojo)" }}><Icono n="basura" s={16} /> Borrar sector</button>
            </div>
          ) : <p className="muted">Tocá un sector del plano para editarlo.</p>}
        </div>
      </div>
      {nodo}
    </>
  );
}
