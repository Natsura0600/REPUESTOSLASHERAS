import Link from "next/link";
import type { Producto, Zona } from "@/lib/types";
import { precioTxt, STOCK_TXT, ubicacionTxt } from "@/lib/util";
import AgregarBtn from "./AgregarBtn";
import Cartel from "./Cartel";
import Icono from "./Icono";

export default function ProductoCard({ p, zona, i = 0 }: { p: Producto; zona?: Zona; i?: number }) {
  const precio = precioTxt(p);
  return (
    <article className="card rv" style={{ ["--d" as string]: `${(i % 4) * 0.07}s` }}>
      <Link href={`/producto/${p.id}`} className="card-img" tabIndex={-1}>
        {p.imagen ? (
          <img src={`/api/img/${p.imagen}`} alt={p.nombre} loading="lazy" />
        ) : (
          <div className="placeholder">
            <Icono n="caja" s={54} />
            <span>{p.categoria}</span>
          </div>
        )}
        <Cartel zona={zona} estante={p.estante} />
      </Link>
      <div className="card-body">
        <div className="card-marca">
          <span>{p.marca}</span>
          <span>{p.codigo}</span>
        </div>
        <h3>
          <Link href={`/producto/${p.id}`}>{p.nombre}</Link>
        </h3>
        {p.compatibilidad ? <p className="card-compat">{p.compatibilidad}</p> : null}
        <span className={`stock ${p.stock}`}>{STOCK_TXT[p.stock]}</span>
        <div className="card-pie">
          {precio ? <span className="precio">{precio}</span> : <span className="precio consultar">Consultá el precio</span>}
          {p.stock !== "sin" && (
            <AgregarBtn
              item={{ id: p.id, nombre: p.nombre, marca: p.marca, codigo: p.codigo, precio: p.mostrarPrecio ? p.precio : null, imagen: p.imagen, ubic: ubicacionTxt(p, zona?.nombre) }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
