"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icono from "./Icono";

interface Sug { id: string; nombre: string; marca: string; compatibilidad: string; zona: { codigo: string; color: string; nombre: string } | null; estante: number | null }

export default function Buscador({ inicial = "", sugerencias = true, placeholder }: { inicial?: string; sugerencias?: boolean; placeholder?: string }) {
  const [q, setQ] = useState(inicial);
  const [res, setRes] = useState<Sug[]>([]);
  const [total, setTotal] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(-1);
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!sugerencias || q.trim().length < 2) {
      setRes([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const j = await r.json();
        setRes(j.resultados);
        setTotal(j.total);
        setActiva(-1);
        setAbierto(true);
      } catch {}
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, sugerencias]);

  useEffect(() => {
    const f = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierto(false);
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (activa >= 0 && res[activa]) return router.push(`/producto/${res[activa].id}`);
    setAbierto(false);
    router.push(`/catalogo${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (!abierto || !res.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiva((a) => Math.min(a + 1, res.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiva((a) => Math.max(a - 1, -1)); }
    if (e.key === "Escape") setAbierto(false);
  };

  return (
    <form className="buscador" onSubmit={enviar} ref={ref} role="search">
      <div className="buscador-caja">
        <Icono n="buscar" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => res.length && setAbierto(true)}
          onKeyDown={teclas}
          placeholder={placeholder || "Buscá por repuesto, marca, código o vehículo…"}
          aria-label="Buscar repuestos"
          autoComplete="off"
        />
        <button className="btn btn-rojo" type="submit">Buscar</button>
      </div>
      {abierto && q.trim().length >= 2 && (
        <div className="sugerencias">
          {res.length === 0 ? (
            <div className="sug"><span>No encontramos “{q}”. <b>Consultanos por WhatsApp</b>, puede que lo tengamos sin cargar.</span></div>
          ) : (
            res.map((r, i) => (
              <Link key={r.id} href={`/producto/${r.id}`} className={`sug ${i === activa ? "activa" : ""}`} onClick={() => setAbierto(false)}>
                <b>{r.nombre} · {r.marca}</b>
                <small>{r.compatibilidad}</small>
                {r.zona ? (
                  <span className="cartel ubic" style={{ ["--zc" as string]: r.zona.color }}>
                    <span className="c">{r.zona.codigo || "•"}</span>
                    <span className="t">{r.estante ? `Est. ${r.estante}` : "Ver"}</span>
                  </span>
                ) : <span />}
              </Link>
            ))
          )}
          {total > res.length && (
            <Link className="sug-pie" href={`/catalogo?q=${encodeURIComponent(q)}`} onClick={() => setAbierto(false)}>
              Ver los {total} resultados →
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
