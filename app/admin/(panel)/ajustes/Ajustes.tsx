"use client";
import { useState } from "react";
import Icono from "@/components/Icono";
import type { Config, Rango } from "@/lib/types";
import { DIAS } from "@/lib/util";
import { api, useToast } from "../toast";

export default function Ajustes({ inicial }: { inicial: Config }) {
  const [c, setC] = useState<Config>(inicial);
  const [cats, setCats] = useState(inicial.categorias.join("\n"));
  const [guardando, setGuardando] = useState(false);
  const [nuevoFeriado, setNuevoFeriado] = useState("");
  const { mostrar, nodo } = useToast();
  const set = <K extends keyof Config>(k: K, v: Config[K]) => setC((x) => ({ ...x, [k]: v }));
  const setRangos = (d: number, rs: Rango[]) => set("horarios", { ...c.horarios, [String(d)]: rs });

  const guardar = async () => {
    setGuardando(true);
    try {
      const g = await api<Config>("/api/admin/config", { method: "PUT", body: JSON.stringify({ ...c, categorias: cats.split("\n") }) });
      setC(g);
      mostrar("Ajustes guardados ✓");
    } catch (e) {
      mostrar((e as Error).message, true);
    }
    setGuardando(false);
  };

  return (
    <>
      <div className="adm-cab">
        <div><h1>Datos del local</h1><p>Horarios, contacto, aviso de la web y rubros.</p></div>
      </div>
      <div className="adm-grid2" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel">
            <h2>Aviso en la parte superior de la web</h2>
            <div className="campo">
              <input value={c.aviso} onChange={(e) => set("aviso", e.target.value)} placeholder="Ej: El sábado 20 abrimos de 9 a 13 hs · Llegaron baterías Moura" />
              <small>Dejalo vacío para ocultarlo.</small>
            </div>
          </div>
          <div className="panel">
            <h2>Horarios</h2>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const rs = c.horarios[String(d)] || [];
              return (
                <div key={d} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--linea)", flexWrap: "wrap" }}>
                  <b style={{ width: 90 }}>{DIAS[d]}</b>
                  {rs.length === 0 && <span className="muted" style={{ fontSize: 14 }}>Cerrado</span>}
                  {rs.map((r, i) => (
                    <span key={i} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <input className="input" type="time" value={r.desde} style={{ width: 110, padding: 6 }} onChange={(e) => setRangos(d, rs.map((x, j) => (j === i ? { ...x, desde: e.target.value } : x)))} />
                      a
                      <input className="input" type="time" value={r.hasta} style={{ width: 110, padding: 6 }} onChange={(e) => setRangos(d, rs.map((x, j) => (j === i ? { ...x, hasta: e.target.value } : x)))} />
                      <button className="icon-btn peligro" onClick={() => setRangos(d, rs.filter((_, j) => j !== i))} title="Quitar"><Icono n="menos" s={14} /></button>
                    </span>
                  ))}
                  {rs.length < 3 && <button className="btn btn-borde btn-chico" onClick={() => setRangos(d, [...rs, { desde: "09:00", hasta: "13:00" }])}>+ turno</button>}
                </div>
              );
            })}
            <div className="campo" style={{ marginTop: 16 }}>
              <label>Feriados / días cerrados</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" type="date" value={nuevoFeriado} onChange={(e) => setNuevoFeriado(e.target.value)} style={{ maxWidth: 200 }} />
                <button className="btn btn-borde btn-chico" onClick={() => { if (nuevoFeriado && !c.feriados.includes(nuevoFeriado)) set("feriados", [...c.feriados, nuevoFeriado].sort()); setNuevoFeriado(""); }}>Agregar</button>
              </div>
              <div className="chips">
                {c.feriados.map((f) => <button key={f} className="chip" onClick={() => set("feriados", c.feriados.filter((x) => x !== f))}>{f.split("-").reverse().join("/")} ✕</button>)}
              </div>
              <small>Esos días la web muestra el local como cerrado.</small>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel">
            <h2>Contacto</h2>
            <div className="form-grid">
              <div className="campo"><label>Teléfono (como se muestra)</label><input value={c.telefono} onChange={(e) => set("telefono", e.target.value)} /></div>
              <div className="campo"><label>WhatsApp (formato 549 + característica + número)</label><input value={c.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /><small>Ej: 5492323583100</small></div>
              <div className="campo"><label>Dirección</label><input value={c.direccion} onChange={(e) => set("direccion", e.target.value)} /></div>
              <div className="campo"><label>Ciudad</label><input value={c.ciudad} onChange={(e) => set("ciudad", e.target.value)} /></div>
              <div className="campo full"><label>Instagram (link)</label><input value={c.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
              <div className="campo full"><label>Linktree (link)</label><input value={c.linktree} onChange={(e) => set("linktree", e.target.value)} /></div>
              <div className="campo"><label>Año de apertura</label><input value={c.anioFundacion} onChange={(e) => set("anioFundacion", e.target.value)} placeholder="Ej: 1998" /></div>
              <div className="campo"><label>Eslogan</label><input value={c.eslogan} onChange={(e) => set("eslogan", e.target.value)} /></div>
              <div className="campo full">
                <label className="check"><input type="checkbox" checked={c.envios} onChange={(e) => set("envios", e.target.checked)} /> Ofrecemos envíos</label>
                {c.envios && <input value={c.textoEnvios} onChange={(e) => set("textoEnvios", e.target.value)} />}
              </div>
            </div>
          </div>
          <div className="panel">
            <h2>Rubros</h2>
            <div className="campo"><textarea rows={10} value={cats} onChange={(e) => setCats(e.target.value)} /><small>Uno por línea. El orden es el que se ve en la web.</small></div>
          </div>
        </div>
      </div>
      <div className="guardar-bar"><button className="btn btn-rojo" onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar ajustes"}</button></div>
      {nodo}
    </>
  );
}
