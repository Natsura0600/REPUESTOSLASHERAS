"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Icono from "@/components/Icono";
import type { Plano, Producto, Rol, Stock } from "@/lib/types";
import { STOCK_TXT } from "@/lib/util";
import { api, useToast } from "../toast";

type Pagina = { total: number; pag: number; paginas: number; items: Producto[] };

export default function ListaProductos({ plano, categorias, rol, filtroStock, falta }: {
  plano: Plano; categorias: string[]; rol: Rol; filtroStock: string; falta: string;
}) {
  const [lista, setLista] = useState<Producto[]>([]);
  const [info, setInfo] = useState<Omit<Pagina, "items">>({ total: 0, pag: 1, paginas: 1 });
  const [pag, setPag] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [zona, setZona] = useState("");
  const [stock, setStock] = useState(filtroStock);
  const [guardando, setGuardando] = useState<string | null>(null);
  const { mostrar, nodo } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const zonas = Object.fromEntries(plano.zonas.map((z) => [z.id, z]));

  const cargar = useCallback(async () => {
    setCargando(true);
    const qs = new URLSearchParams({ q, cat, zona, stock, falta, pag: String(pag) });
    try {
      const r = await api<Pagina>(`/api/admin/productos?${qs}`);
      setLista(r.items);
      setInfo({ total: r.total, pag: r.pag, paginas: r.paginas });
    } catch (e) {
      mostrar((e as Error).message, true);
    }
    setCargando(false);
  }, [q, cat, zona, stock, falta, pag, mostrar]);

  useEffect(() => {
    const t = setTimeout(cargar, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [cargar, q]);
  useEffect(() => setPag(1), [q, cat, zona, stock]);
  const filtrada = lista;

  const parche = async (p: Producto, cambios: Partial<Producto>) => {
    setGuardando(p.id);
    const antes = lista;
    setLista((l) => l.map((x) => (x.id === p.id ? { ...x, ...cambios } : x)));
    try {
      const nuevo = await api<Producto>("/api/admin/productos", { method: "POST", body: JSON.stringify({ id: p.id, parche: cambios }) });
      setLista((l) => l.map((x) => (x.id === p.id ? nuevo : x)));
      mostrar("Guardado ✓");
    } catch (e) {
      setLista(antes);
      mostrar((e as Error).message, true);
    }
    setGuardando(null);
  };

  const borrar = async (p: Producto) => {
    if (!confirm(`¿Borrar "${p.nombre}" definitivamente?`)) return;
    try {
      await api(`/api/admin/productos?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
      setLista((l) => l.filter((x) => x.id !== p.id));
      mostrar("Producto borrado");
    } catch (e) {
      mostrar((e as Error).message, true);
    }
  };

  const importar = async (f: File) => {
    const texto = await f.text();
    mostrar("Importando planilla…");
    try {
      const r = await fetch("/api/admin/csv", { method: "POST", body: texto });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      mostrar(`Listo: ${j.creados} nuevos, ${j.actualizados} actualizados`);
      cargar();
    } catch (e) {
      mostrar((e as Error).message, true);
    }
  };

  return (
    <>
      <div className="adm-cab">
        <div>
          <h1>Productos</h1>
          <p>Los cambios de stock y precio se guardan solos al modificarlos.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-borde btn-chico" href="/api/admin/csv"><Icono n="bajar" s={16} /> Exportar Excel/CSV</a>
          <button className="btn btn-borde btn-chico" onClick={() => fileRef.current?.click()}><Icono n="subir" s={16} /> Importar planilla</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
          <Link className="btn btn-rojo btn-chico" href="/admin/productos/nuevo"><Icono n="mas" s={16} /> Nuevo</Link>
        </div>
      </div>
      {falta === "ubicacion" && <div className="alerta-box warn">Mostrando solo productos sin ubicación. Asignales pasillo y estante para que aparezcan en el mapa. <Link href="/admin/productos">Ver todos</Link></div>}
      <div className="barra">
        <input className="input" placeholder="Buscar por nombre, marca, código…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todos los rubros</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Todo el local</option>
          {plano.zonas.filter((z) => z.estantes > 0).map((z) => <option key={z.id} value={z.id}>{z.codigo ? `${z.codigo} · ` : ""}{z.nombre}</option>)}
        </select>
        <select className="input" value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="">Cualquier stock</option>
          {Object.entries(STOCK_TXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="muted" style={{ fontSize: 13 }}>{cargando ? "Buscando…" : `${info.total.toLocaleString("es-AR")} resultados`}</span>
      </div>
      <div className="tabla-wrap">
        <table className="tabla">
          <thead>
            <tr><th></th><th>Producto</th><th>Ubicación</th><th>Stock</th><th>Precio</th><th>Web</th><th></th></tr>
          </thead>
          <tbody>
            {filtrada.map((p) => {
              const z = zonas[p.zonaId];
              return (
                <tr key={p.id} style={{ opacity: guardando === p.id ? 0.6 : 1 }}>
                  <td><div className="mini">{p.imagen ? <img src={`/api/img/${p.imagen}`} alt="" /> : <Icono n="caja" s={20} />}</div></td>
                  <td style={{ minWidth: 220 }}>
                    <Link href={`/admin/productos/${p.id}`} style={{ textDecoration: "none", fontWeight: 600 }}>{p.nombre}</Link>
                    <div className="muted" style={{ fontSize: 12 }}>{p.marca} · {p.codigo} · {p.categoria}</div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {z ? <span className="cartel" style={{ ["--zc" as string]: z.color }}><span className="c">{z.codigo || "•"}</span><span className="t">{p.estante ? `Est. ${p.estante}` : z.tipo}</span></span> : <span style={{ color: "var(--rojo)", fontSize: 12, fontWeight: 600 }}>Sin ubicar</span>}
                  </td>
                  <td>
                    <select value={p.stock} onChange={(e) => parche(p, { stock: e.target.value as Stock })}>
                      {Object.entries(STOCK_TXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <input key={`${p.id}-${p.precio}`} className="precio-in" type="number" min={0} defaultValue={p.precio ?? ""} placeholder="—"
                      onBlur={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        if (v !== p.precio) parche(p, { precio: v, mostrarPrecio: v != null ? p.mostrarPrecio || p.precio == null : false });
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                  </td>
                  <td>
                    <label className="check" title="Mostrar precio en la web" style={{ fontSize: 12 }}>
                      <input type="checkbox" checked={p.mostrarPrecio} onChange={(e) => parche(p, { mostrarPrecio: e.target.checked })} /> $
                    </label>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <a className="icon-btn" href={`/producto/${p.id}`} target="_blank" title="Ver en la web"><Icono n="ojo" s={16} /></a>{" "}
                    <Link className="icon-btn" href={`/admin/productos/${p.id}`} title="Editar"><Icono n="lapiz" s={16} /></Link>{" "}
                    {rol === "admin" && <button className="icon-btn peligro" onClick={() => borrar(p)} title="Borrar"><Icono n="basura" s={16} /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!cargando && filtrada.length === 0 && <p className="muted" style={{ padding: 16 }}>No hay productos con esos filtros.</p>}
      </div>
      {info.paginas > 1 && (
        <div className="barra" style={{ justifyContent: "center", marginTop: 14 }}>
          <button className="btn btn-borde btn-chico" disabled={pag <= 1} onClick={() => setPag(pag - 1)}>← Anterior</button>
          <span className="muted" style={{ fontSize: 14 }}>Página {info.pag} de {info.paginas}</span>
          <button className="btn btn-borde btn-chico" disabled={pag >= info.paginas} onClick={() => setPag(pag + 1)}>Siguiente →</button>
        </div>
      )}
      <details className="panel" style={{ marginTop: 18 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>¿Cómo cargar muchos productos de una vez con Excel?</summary>
        <ol className="muted" style={{ fontSize: 14 }}>
          <li>Tocá <b>Exportar Excel/CSV</b>: se descarga la planilla con todos los productos actuales (sirve de modelo).</li>
          <li>Abrila con Excel o Google Sheets y agregá filas. Columnas: nombre, marca, codigo, categoria, compatibilidad, descripcion, precio, mostrar_precio (si/no), stock (disponible / pocas / consultar / sin), pasillo (letra: A, B, C… o M, X), estante (número), lado (izq/der), nota, destacado (si/no).</li>
          <li>Dejá vacía la columna <b>id</b> en los productos nuevos. Si un producto ya existe (mismo id, o misma marca + código) se actualiza.</li>
          <li>Guardá como <b>CSV</b> y tocá <b>Importar planilla</b>. Las fotos se agregan después desde cada producto.</li>
        </ol>
      </details>
      {nodo}
    </>
  );
}
