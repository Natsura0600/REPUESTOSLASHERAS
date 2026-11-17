import type { Metadata } from "next";
import Link from "next/link";
import Buscador from "@/components/Buscador";
import ProductoCard from "@/components/ProductoCard";
import { consultar, datosSitio } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Catálogo de repuestos" };

type SP = Promise<{ q?: string; cat?: string; zona?: string; stock?: string; orden?: string; pag?: string }>;
const POR_PAG = 24;

export default async function Catalogo({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { plano, config, zonas } = await datosSitio();
  const r = await consultar({ q: sp.q, cat: sp.cat, zona: sp.zona, stock: sp.stock, orden: sp.orden, pag: Number(sp.pag) || 1, porPag: POR_PAG });
  const { pag, paginas, items: visibles, porCat } = r;
  const lista = { length: r.total };
  const baseCats = { length: r.totalSinRubro };
  const url = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const todo = { ...sp, pag: undefined, ...cambios };
    Object.entries(todo).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return `/catalogo${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <section className="pag-cab">
        <div className="contenedor">
          <span className="eyebrow">Catálogo</span>
          <h1 className="display">{sp.q ? <>Resultados para “{sp.q}”</> : sp.cat ? sp.cat : "Todos los repuestos"}</h1>
          <div style={{ marginTop: 22 }}><Buscador inicial={sp.q || ""} /></div>
        </div>
        <img className="marca-agua" src="/mascota.png" alt="" />
      </section>
      <div className="contenedor cat-layout">
        <aside className="filtros">
          <div>
            <h4>Rubro</h4>
            <div className="filtro-lista">
              <Link href={url({ cat: undefined })} className={!sp.cat ? "on" : ""}>Todos <small>{baseCats.length}</small></Link>
              {config.categorias.map((c) => {
                const n = porCat[c] || 0;
                if (!n) return null;
                return <Link key={c} href={url({ cat: c })} className={sp.cat === c ? "on" : ""}>{c} <small>{n}</small></Link>;
              })}
            </div>
          </div>
          <div>
            <h4>Ubicación</h4>
            <div className="filtro-lista">
              <Link href={url({ zona: undefined })} className={!sp.zona ? "on" : ""}>Todo el local</Link>
              {plano.zonas.filter((z) => z.codigo).map((z) => (
                <Link key={z.id} href={url({ zona: z.id })} className={sp.zona === z.id ? "on" : ""}>
                  <span><b style={{ color: sp.zona === z.id ? "#fff" : z.color }}>{z.codigo}</b> · {z.nombre.replace(/^Pasillo\s+\w+\s*·\s*/i, "")}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4>Disponibilidad</h4>
            <div className="filtro-lista">
              <Link href={url({ stock: undefined })} className={!sp.stock ? "on" : ""}>Mostrar todo</Link>
              <Link href={url({ stock: "si" })} className={sp.stock === "si" ? "on" : ""}>Solo con stock</Link>
            </div>
          </div>
        </aside>
        <div>
          <div className="cat-top">
            <span className="muted">{lista.length.toLocaleString("es-AR")} {lista.length === 1 ? "repuesto" : "repuestos"}{paginas > 1 ? ` · página ${pag} de ${paginas}` : ""}</span>
            <div className="chips" style={{ marginTop: 0 }}>
              <Link className={`chip ${!sp.orden ? "on" : ""}`} href={url({ orden: undefined })}>Relevancia</Link>
              <Link className={`chip ${sp.orden === "precio-asc" ? "on" : ""}`} href={url({ orden: "precio-asc" })}>Menor precio</Link>
              <Link className={`chip ${sp.orden === "precio-desc" ? "on" : ""}`} href={url({ orden: "precio-desc" })}>Mayor precio</Link>
            </div>
          </div>
          {visibles.length ? (
            <div className="grilla">
              {visibles.map((p, i) => <ProductoCard key={p.id} p={p} zona={zonas[p.zonaId]} i={i} />)}
            </div>
          ) : (
            <div className="vacio">
              <img src="/mascota.png" alt="" />
              <h3 style={{ margin: "0 0 6px" }}>No lo encontramos en la web</h3>
              <p className="muted" style={{ margin: "0 0 18px" }}>Puede que lo tengamos y no esté cargado. Mandanos el modelo del vehículo y te respondemos.</p>
              <a className="btn btn-wa" target="_blank" rel="noreferrer" href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola! Busco: ${sp.q || sp.cat || ""}. ¿Lo tienen?`)}`}>Consultar por WhatsApp</a>
            </div>
          )}
          {paginas > 1 && (
            <nav className="chips" style={{ justifyContent: "center", marginTop: 32 }} aria-label="Páginas">
              {pag > 1 && <Link className="chip" href={url({ pag: String(pag - 1) })}>← Anterior</Link>}
              {Array.from(new Set([1, pag - 2, pag - 1, pag, pag + 1, pag + 2, paginas]))
                .filter((n) => n >= 1 && n <= paginas)
                .sort((a, b) => a - b)
                .map((n, i, arr) => (
                  <span key={n} style={{ display: "contents" }}>
                    {i > 0 && n - arr[i - 1] > 1 && <span className="muted">…</span>}
                    <Link className={`chip ${pag === n ? "on" : ""}`} href={url({ pag: String(n) })}>{n}</Link>
                  </span>
                ))}
              {pag < paginas && <Link className="chip" href={url({ pag: String(pag + 1) })}>Siguiente →</Link>}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
