import Link from "next/link";
import Icono from "@/components/Icono";
import Plano from "@/components/Plano";
import { sesionActual } from "@/lib/auth";
import { getConfig, getPlano, getProductos, usaGitHub } from "@/lib/store";
import { estadoLocal } from "@/lib/util";

export default async function Resumen() {
  const [productos, plano, config, rol] = await Promise.all([getProductos(true), getPlano(true), getConfig(true), sesionActual()]);
  const sinStock = productos.filter((p) => p.stock === "sin").length;
  const pocas = productos.filter((p) => p.stock === "pocas").length;
  const sinUbic = productos.filter((p) => !p.zonaId).length;
  const sinFoto = productos.filter((p) => !p.imagen).length;
  const conteo: Record<string, number> = {};
  productos.forEach((p) => (conteo[p.zonaId] = (conteo[p.zonaId] || 0) + 1));
  const recientes: typeof productos = [];
  for (const p of productos) {
    // top 6 sin ordenar los 30.000
    if (recientes.length < 6 || p.actualizado > recientes[5].actualizado) {
      recientes.push(p);
      recientes.sort((a, b) => b.actualizado.localeCompare(a.actualizado));
      recientes.length = Math.min(recientes.length, 6);
    }
  }
  const est = estadoLocal(config);

  return (
    <>
      <div className="adm-cab">
        <div>
          <h1>Hola 👋</h1>
          <p>El local figura en la web como: <b style={{ color: est.abierto ? "var(--ok)" : "var(--rojo)" }}>{est.texto}</b></p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn-rojo"><Icono n="mas" s={18} /> Cargar producto</Link>
      </div>

      {!usaGitHub && process.env.VERCEL && (
        <div className="alerta-box err"><b>Atención:</b> faltan las variables GITHUB_TOKEN y GITHUB_REPO en Vercel. Hasta configurarlas, los cambios del panel no se pueden guardar. Ver la guía de puesta en marcha (paso 5).</div>
      )}
      {!usaGitHub && !process.env.VERCEL && (
        <div className="alerta-box info">Modo local: los cambios se guardan en la carpeta <code>data/</code> de esta computadora.</div>
      )}

      <div className="kpis">
        <Link className="kpi" href="/admin/productos"><b>{productos.length.toLocaleString("es-AR")}</b><span>productos publicados</span></Link>
        <Link className={`kpi ${sinStock ? "alerta" : ""}`} href="/admin/productos?stock=sin"><b>{sinStock}</b><span>sin stock</span></Link>
        <Link className={`kpi ${pocas ? "alerta" : ""}`} href="/admin/productos?stock=pocas"><b>{pocas}</b><span>últimas unidades (reponer)</span></Link>
        <Link className={`kpi ${sinUbic ? "alerta" : ""}`} href="/admin/productos?falta=ubicacion"><b>{sinUbic}</b><span>sin ubicación en el local</span></Link>
      </div>

      <div className="adm-grid2">
        <div className="panel">
          <h2>Productos por sector</h2>
          <Plano plano={plano} conteo={conteo} />
          {rol === "admin" && <Link href="/admin/plano" className="btn btn-borde btn-chico" style={{ marginTop: 12 }}>Editar plano</Link>}
        </div>
        <div className="panel">
          <h2>Últimos cambios</h2>
          <table className="tabla"><tbody>
            {recientes.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/productos/${p.id}`} style={{ textDecoration: "none", fontWeight: 600 }}>{p.nombre}</Link><div className="muted" style={{ fontSize: 12 }}>{p.marca}</div></td>
                <td className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{new Date(p.actualizado).toLocaleDateString("es-AR")}</td>
              </tr>
            ))}
          </tbody></table>
          {sinFoto > 0 && <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>💡 {sinFoto.toLocaleString("es-AR")} productos todavía no tienen foto. Priorizá los que más se venden.</p>}
        </div>
      </div>
    </>
  );
}
