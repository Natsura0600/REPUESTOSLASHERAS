import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AgregarBtn from "@/components/AgregarBtn";
import Estanteria from "@/components/Estanteria";
import Icono from "@/components/Icono";
import Plano from "@/components/Plano";
import ProductoCard from "@/components/ProductoCard";
import { consultar, datosSitio } from "@/lib/datos";
import { getProducto } from "@/lib/store";
import { precioTxt, STOCK_TXT, ubicacionTxt, waLink } from "@/lib/util";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProducto(id);
  return p ? { title: `${p.nombre} ${p.marca}`, description: `${p.nombre} ${p.marca} ${p.codigo}. ${p.compatibilidad}` } : {};
}

export default async function ProductoPag({ params }: { params: Params }) {
  const { id } = await params;
  const [{ plano, config, zonas }, p] = await Promise.all([datosSitio(), getProducto(id)]);
  if (!p) notFound();
  const z = zonas[p.zonaId];
  const precio = precioTxt(p);
  const ubic = ubicacionTxt(p, z?.nombre);
  const relacionados = (await consultar({ q: p.compatibilidad.split(/[\/,]/)[0], cat: p.categoria, stock: "si", porPag: 5 })).items
    .concat((await consultar({ cat: p.categoria, stock: "si", porPag: 5 })).items)
    .filter((x, i, arr) => x.id !== p.id && arr.findIndex((y) => y.id === x.id) === i)
    .slice(0, 4);
  const consulta = `Hola! Quería consultar por: ${p.nombre} ${p.marca} (cód. ${p.codigo}). ¿Tienen disponible?`;

  return (
    <div className="contenedor">
      <div className="migas">
        <Link href="/">Inicio</Link> / <Link href="/catalogo">Catálogo</Link> / <Link href={`/catalogo?cat=${encodeURIComponent(p.categoria)}`}>{p.categoria}</Link> / {p.nombre}
      </div>
      <div className="det">
        <div className="rv">
          <div className="det-img">
            {p.imagen ? <img src={`/api/img/${p.imagen}`} alt={p.nombre} /> : (
              <div className="placeholder"><Icono n="caja" s={110} /><span>{p.categoria}</span></div>
            )}
          </div>
        </div>
        <div className="rv" style={{ ["--d" as string]: ".08s" }}>
          <span className="eyebrow">{p.marca}</span>
          <h1>{p.nombre}</h1>
          <span className={`stock ${p.stock}`} style={{ fontSize: 14 }}>{STOCK_TXT[p.stock]}</span>
          <div style={{ margin: "18px 0 0" }}>
            {precio ? <span className="precio" style={{ fontSize: 44 }}>{precio}</span> : <span className="precio consultar" style={{ fontSize: 17 }}>Precio a consultar</span>}
          </div>
          <table className="det-tabla">
            <tbody>
              <tr><th>Código</th><td>{p.codigo || "—"}</td></tr>
              <tr><th>Marca</th><td>{p.marca}</td></tr>
              <tr><th>Rubro</th><td>{p.categoria}</td></tr>
              {p.compatibilidad ? <tr><th>Compatible con</th><td>{p.compatibilidad}</td></tr> : null}
              {p.descripcion ? <tr><th>Detalle</th><td>{p.descripcion}</td></tr> : null}
            </tbody>
          </table>
          <div className="det-acc">
            {p.stock !== "sin" && (
              <AgregarBtn grande item={{ id: p.id, nombre: p.nombre, marca: p.marca, codigo: p.codigo, precio: p.mostrarPrecio ? p.precio : null, imagen: p.imagen, ubic }} />
            )}
            <a className="btn btn-wa" href={waLink(config.whatsapp, consulta)} target="_blank" rel="noreferrer"><Icono n="wa" s={18} /> Consultar</a>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Antes de separarlo te confirmamos precio y disponibilidad por WhatsApp.</p>

          {z && (
            <div className="ubic-box">
              <span className="eyebrow">Dónde está en el local</span>
              <h3 style={{ marginTop: 8 }}>{ubic}</h3>
              {p.nota ? <p className="muted" style={{ margin: "4px 0 0" }}>{p.nota}</p> : null}
              <div className="ubic-grid">
                <div className="plano-wrap" style={{ padding: 8 }}>
                  <Plano plano={plano} resaltar={z.id} estante={p.estante} compacto />
                </div>
                {z.estantes > 0 ? <Estanteria zona={z} estante={p.estante} lado={p.lado} /> : null}
              </div>
              <Link href={`/mapa?zona=${z.id}&p=${p.id}`} className="btn btn-borde btn-chico" style={{ marginTop: 14 }}>Ver en el mapa completo <Icono n="mapa" s={16} /></Link>
            </div>
          )}
        </div>
      </div>
      {relacionados.length > 0 && (
        <section style={{ paddingBottom: 80 }}>
          <div className="sec-cab rv" style={{ marginBottom: 24 }}>
            <h2 className="display" style={{ fontSize: 40 }}>También en {p.categoria}</h2>
          </div>
          <div className="grilla">
            {relacionados.map((r, i) => <ProductoCard key={r.id} p={r} zona={zonas[r.zonaId]} i={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
