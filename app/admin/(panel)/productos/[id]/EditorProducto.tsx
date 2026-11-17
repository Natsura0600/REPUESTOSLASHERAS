"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Estanteria from "@/components/Estanteria";
import Icono from "@/components/Icono";
import Plano from "@/components/Plano";
import type { Plano as TPlano, Producto } from "@/lib/types";
import { STOCK_TXT } from "@/lib/util";
import { api, useToast } from "../../toast";

/** Achica y comprime la foto en el navegador (máx 1000px, webp) antes de subirla. */
async function comprimir(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const max = 800;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  let data = c.toDataURL("image/webp", 0.78);
  if (!data.startsWith("data:image/webp")) data = c.toDataURL("image/jpeg", 0.85); // Safari viejo
  return data;
}

export default function EditorProducto({ inicial, plano, categorias, marcas }: { inicial: Producto; plano: TPlano; categorias: string[]; marcas: string[] }) {
  const [p, setP] = useState<Producto>({ ...inicial, categoria: inicial.categoria || categorias[0] || "" });
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [preview, setPreview] = useState<string>(inicial.imagen ? `/api/img/${inicial.imagen}` : "");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mostrar, nodo } = useToast();
  const esNuevo = !inicial.id;
  const zona = plano.zonas.find((z) => z.id === p.zonaId);
  const set = <K extends keyof Producto>(k: K, v: Producto[K]) => setP((x) => ({ ...x, [k]: v }));

  const subirFoto = async (f: File) => {
    setSubiendo(true);
    try {
      const data = await comprimir(f);
      setPreview(data);
      const { archivo } = await api<{ archivo: string }>("/api/admin/imagen", { method: "POST", body: JSON.stringify({ data, nombre: p.nombre || "foto" }) });
      set("imagen", archivo);
      mostrar("Foto subida. Acordate de guardar.");
    } catch (e) {
      mostrar((e as Error).message, true);
      setPreview(p.imagen ? `/api/img/${p.imagen}` : "");
    }
    setSubiendo(false);
  };

  const guardar = async (otro = false) => {
    if (!p.nombre.trim()) return mostrar("Poné un nombre al producto", true);
    setGuardando(true);
    try {
      const g = await api<Producto>("/api/admin/productos", { method: "POST", body: JSON.stringify({ ...p, id: inicial.id || undefined }) });
      mostrar("Guardado ✓ (en la web en segundos)");
      if (otro) {
        // Mantiene ubicación, marca y rubro para cargar rápido el siguiente
        setP({ ...inicial, id: "", nombre: "", codigo: "", compatibilidad: "", descripcion: "", precio: null, imagen: "", zonaId: p.zonaId, estante: p.estante, lado: p.lado, categoria: p.categoria, marca: p.marca, mostrarPrecio: p.mostrarPrecio });
        setPreview("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.replace(`/admin/productos/${g.id}`);
        router.refresh();
      }
    } catch (e) {
      mostrar((e as Error).message, true);
    }
    setGuardando(false);
  };

  return (
    <>
      <div className="adm-cab">
        <div>
          <p style={{ margin: 0 }}><Link href="/admin/productos" className="muted">← Productos</Link></p>
          <h1>{esNuevo ? "Cargar producto" : "Editar producto"}</h1>
        </div>
        {!esNuevo && <a className="btn btn-borde btn-chico" href={`/producto/${inicial.id}`} target="_blank"><Icono n="ojo" s={16} /> Ver en la web</a>}
      </div>

      <div className="editor-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel">
            <h2>Datos</h2>
            <div className="form-grid">
              <div className="campo full"><label>Nombre del producto *</label><input value={p.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Filtro de aceite" autoFocus={esNuevo} /></div>
              <div className="campo">
                <label>Marca</label>
                <input list="marcas" value={p.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Ej: Fram" />
                <datalist id="marcas">{marcas.map((m) => <option key={m} value={m} />)}</datalist>
              </div>
              <div className="campo"><label>Código</label><input value={p.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="Ej: PH5949" /></div>
              <div className="campo">
                <label>Rubro</label>
                <select value={p.categoria} onChange={(e) => set("categoria", e.target.value)}>
                  {categorias.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="campo">
                <label>Stock</label>
                <select value={p.stock} onChange={(e) => set("stock", e.target.value as Producto["stock"])}>
                  {Object.entries(STOCK_TXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="campo full"><label>Compatible con</label><input value={p.compatibilidad} onChange={(e) => set("compatibilidad", e.target.value)} placeholder="Ej: Fiat Palio / Siena 1.4 Fire" /><small>Es lo que más busca la gente: poné modelos, motor y años.</small></div>
              <div className="campo full"><label>Descripción</label><textarea value={p.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></div>
              <div className="campo"><label>Precio (ARS)</label><input type="number" min={0} value={p.precio ?? ""} onChange={(e) => set("precio", e.target.value === "" ? null : Number(e.target.value))} placeholder="Sin precio" /></div>
              <div className="campo" style={{ justifyContent: "flex-end", gap: 10 }}>
                <label className="check"><input type="checkbox" checked={p.mostrarPrecio} onChange={(e) => set("mostrarPrecio", e.target.checked)} /> Mostrar precio en la web</label>
                <label className="check"><input type="checkbox" checked={p.destacado} onChange={(e) => set("destacado", e.target.checked)} /> Destacar en el inicio</label>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>¿Dónde está en el local?</h2>
            <p className="muted" style={{ marginTop: -6, fontSize: 14 }}>Tocá el sector en el plano y después el estante.</p>
            <div className="plano-wrap" style={{ padding: 8 }}>
              <Plano plano={plano} resaltar={p.zonaId || null} estante={p.estante}
                onZona={(z) => { if (z.estantes > 0) { set("zonaId", z.id); if (p.estante && p.estante > z.estantes) set("estante", null); } }} />
            </div>
            {zona ? (
              <div className="form-grid" style={{ marginTop: 16, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="campo">
                    <label>Sector elegido</label>
                    <b>{zona.nombre}</b>
                  </div>
                  <div className="campo">
                    <label>Estante (1 = el de abajo)</label>
                    <div className="niveles">
                      {Array.from({ length: zona.estantes }).map((_, i) => (
                        <button type="button" key={i} className={p.estante === i + 1 ? "on" : ""} onClick={() => set("estante", p.estante === i + 1 ? null : i + 1)}>{i + 1}</button>
                      ))}
                    </div>
                  </div>
                  <div className="campo">
                    <label>Lado</label>
                    <div className="niveles">
                      {([["", "—"], ["izq", "Izquierda"], ["der", "Derecha"]] as const).map(([v, t]) => (
                        <button type="button" key={v} className={p.lado === v ? "on" : ""} onClick={() => set("lado", v)} style={{ padding: "0 12px" }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="campo"><label>Nota de ubicación</label><input value={p.nota} onChange={(e) => set("nota", e.target.value)} placeholder="Ej: cajas rojas, al fondo" /></div>
                </div>
                <Estanteria zona={zona} estante={p.estante} lado={p.lado} />
              </div>
            ) : <div className="alerta-box warn" style={{ marginTop: 14, marginBottom: 0 }}>Todavía no elegiste ubicación.</div>}
          </div>
        </div>

        <div className="panel" style={{ position: "sticky", top: 20 }}>
          <h2>Foto</h2>
          <div className="foto-drop" onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) subirFoto(f); }}>
            {preview ? <img src={preview} alt="" /> : (
              <div className="muted"><Icono n="subir" s={34} /><p style={{ margin: "8px 0 0" }}>Tocá para sacar o elegir una foto</p><small>Desde el celular abre la cámara</small></div>
            )}
            {subiendo && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.75)", display: "grid", placeItems: "center", fontWeight: 600 }}>Subiendo…</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && subirFoto(e.target.files[0])} />
          {preview && <button className="btn btn-borde btn-chico" style={{ marginTop: 10 }} onClick={() => { set("imagen", ""); setPreview(""); }}>Quitar foto</button>}
          <p className="muted" style={{ fontSize: 13 }}>Consejo: fondo liso y buena luz. La foto se achica automáticamente para que la web cargue rápido.</p>
        </div>
      </div>

      <div className="guardar-bar">
        <Link href="/admin/productos" className="btn btn-borde">Cancelar</Link>
        {esNuevo && <button className="btn btn-borde" onClick={() => guardar(true)} disabled={guardando || subiendo}>Guardar y cargar otro</button>}
        <button className="btn btn-rojo" onClick={() => guardar()} disabled={guardando || subiendo}>{guardando ? "Guardando…" : "Guardar"}</button>
      </div>
      {nodo}
    </>
  );
}
