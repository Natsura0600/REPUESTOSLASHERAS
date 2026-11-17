import type { Metadata } from "next";
import Link from "next/link";
import Icono from "@/components/Icono";
import { datosSitio } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nosotros" };

export default async function Nosotros() {
  const { plano, config, total, marcas: listaMarcas } = await datosSitio();
  const cifras = [
    [total.toLocaleString("es-AR"), "repuestos publicados"],
    [String(listaMarcas.length), "marcas en stock"],
    [String(plano.zonas.filter((z) => z.codigo).length), "sectores organizados"],
    [config.anioFundacion ? config.anioFundacion : "Luján", config.anioFundacion ? "atendiendo desde" : "nuestra ciudad"],
  ];
  return (
    <>
      <section className="pag-cab">
        <div className="contenedor">
          <span className="eyebrow">Nosotros</span>
          <h1 className="display">Un comercio de barrio, organizado como un depósito</h1>
          <p>Somos Repuestos “Las Heras”, en {config.direccion}, {config.ciudad}. Atendemos a particulares, mecánicos y talleres con repuestos para autos y motos.</p>
        </div>
        <img className="marca-agua" src="/mascota.png" alt="" />
      </section>

      <section className="seccion">
        <div className="contenedor dos-col">
          <div className="rv">
            <p className="cita">Conocemos cada pieza que tenemos y <em>sabemos exactamente dónde está.</em></p>
          </div>
          <div className="rv muted" style={{ fontSize: 17 }}>
            <p style={{ marginTop: 0 }}>Detrás del mostrador hay gente que sabe de mecánica y que se toma el tiempo de buscar la pieza correcta. Preguntamos modelo, año y motor porque un repuesto equivocado es un viaje perdido para vos y una tarde perdida en el taller.</p>
            <p>Ordenamos el local por pasillos y estantes y lo publicamos en esta web para que puedas consultar el stock cuando quieras, incluso con el local cerrado. Mandás tu pedido por WhatsApp y cuando llegás ya está separado.</p>
            <p style={{ marginBottom: 0 }}>Nuestro perro guardián, el de la rueda, es la cara del negocio: fiel, paciente y siempre en el local.</p>
          </div>
        </div>
      </section>

      <section className="franja">
        <div className="contenedor franja-in">
          {cifras.map(([n, t]) => (
            <div className="franja-item" key={t} style={{ flexDirection: "column", gap: 4 }}>
              <span className="display" style={{ fontSize: 46, color: "#fff" }}>{n}</span>
              <small>{t}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="sec-cab rv">
            <div>
              <span className="eyebrow">Cómo trabajamos</span>
              <h2 className="display">Tres cosas que no negociamos</h2>
            </div>
          </div>
          <div className="valores rv">
            {[
              ["escudo", "Repuesto correcto", "Verificamos compatibilidad por modelo, año y motor antes de venderte una pieza. Si tenemos dudas, la comparamos con la tuya."],
              ["reloj", "Tu tiempo vale", "Stock a la vista, pedido por WhatsApp y retiro rápido. Sin hacer fila para preguntar si hay."],
              ["llave", "Trato directo", "Hablás con quien atiende el local. Si algo no está, te decimos en cuánto lo conseguimos."],
            ].map(([ic, t, d]) => (
              <div className="valor" key={t}>
                <Icono n={ic as "escudo"} s={28} />
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion crema">
        <div className="contenedor dos-col">
          <div className="rv">
            <span className="eyebrow">Qué vas a encontrar</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,5vw,56px)", margin: "14px 0 18px" }}>Rubros</h2>
            <div className="chips">
              {config.categorias.map((c) => <Link className="chip" key={c} href={`/catalogo?cat=${encodeURIComponent(c)}`}>{c}</Link>)}
            </div>
          </div>
          <div className="rv" style={{ textAlign: "center" }}>
            <img src="/logo-full.png" alt='Logo de Repuestos "Las Heras"' style={{ maxWidth: 380, margin: "0 auto" }} />
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="contenedor">
          <h2 className="display rv">Pasá a conocernos</h2>
          <p className="rv">{config.direccion}, {config.ciudad}.</p>
          <div className="rv" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/contacto">Horarios y cómo llegar</Link>
            <Link className="btn btn-borde" href="/catalogo">Ver catálogo</Link>
          </div>
        </div>
        <img src="/mascota.png" alt="" />
      </section>
    </>
  );
}
