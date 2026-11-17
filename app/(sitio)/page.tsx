import Link from "next/link";
import Buscador from "@/components/Buscador";
import EstadoLocal from "@/components/EstadoLocal";
import Icono from "@/components/Icono";
import Plano from "@/components/Plano";
import ProductoCard from "@/components/ProductoCard";
import { datosSitio } from "@/lib/datos";
import { horarioResumen } from "@/lib/util";

export const dynamic = "force-dynamic";

const MARCAS = ["Bosch", "NGK", "Fram", "Mann", "SKF", "Gates", "Dayco", "Fric-Rot", "Corven", "Monroe", "Philips", "Osram", "Moura", "YPF Elaion", "Shell", "Castrol", "Sachs", "Pirelli"];

export default async function Inicio() {
  const { plano, config, zonas, conteo, conteoCat: porCat, destacados, total } = await datosSitio();
  const cats = config.categorias.filter((c) => porCat[c]).slice(0, 8);
  const hs = horarioResumen(config);
  const pasillos = plano.zonas.filter((z) => z.codigo).sort((a, b) => (a.tipo === "pasillo" ? 0 : 1) - (b.tipo === "pasillo" ? 0 : 1) || a.codigo.localeCompare(b.codigo));
  const telLimpio = config.telefono.replace(/\D/g, "");

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="contenedor hero-grid">
          <div>
            <span className="eyebrow entra">{config.direccion} · {config.ciudad.split(",")[0]}</span>
            <h1 className="display entra" style={{ ["--d" as string]: ".08s" }}>
              El repuesto que buscás, <em>en el pasillo exacto.</em>
            </h1>
            <p className="hero-bajada entra" style={{ ["--d" as string]: ".16s" }}>
              Consultá nuestro stock desde el celular, mirá en qué pasillo y estante está cada pieza y dejá tu pedido armado por WhatsApp. Cuando llegás, ya está listo.
            </p>
            <div className="entra" style={{ ["--d" as string]: ".24s" }}>
              <Buscador />
              <div className="chips">
                <span>Lo más buscado:</span>
                {["Filtro de aceite", "Bujía", "Pastillas de freno", "Kit de distribución", "Cubierta moto"].map((t) => (
                  <Link key={t} className="chip" href={`/catalogo?q=${encodeURIComponent(t)}`}>{t}</Link>
                ))}
              </div>
            </div>
            <div className="hero-datos entra" style={{ ["--d" as string]: ".32s" }}>
              <span><Icono n="reloj" s={16} /> {hs[0]?.dias} · {hs[0]?.horario}</span>
              <span><Icono n="tel" s={16} /> {config.telefono}</span>
            </div>
          </div>
          <div className="hero-arte entra" style={{ ["--d" as string]: ".2s" }}>
            <div className="disco" />
            <img src="/mascota.png" alt="Mascota de Repuestos Las Heras" width={395} height={595} />
            <div className="hero-sello">
              <b>{total >= 1000 ? `${(Math.floor(total / 1000) * 1000).toLocaleString("es-AR")}+` : total} repuestos</b>
              ubicados en {pasillos.length} sectores
            </div>
          </div>
        </div>
      </section>

      {/* FRANJA */}
      <section className="franja">
        <div className="contenedor franja-in">
          <div className="franja-item"><Icono n="reloj" /><div><small>Ahora</small><b><EstadoLocal config={config} /></b></div></div>
          <div className="franja-item"><Icono n="pin" /><div><small>Dirección</small><b>{config.direccion}, {config.ciudad.split(",")[0]}</b></div></div>
          <div className="franja-item"><Icono n="tel" /><div><small>Teléfono</small><b><a href={`tel:${telLimpio}`}>{config.telefono}</a></b></div></div>
          <div className="franja-item"><Icono n="wa" /><div><small>WhatsApp</small><b><a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer">Pedidos y consultas 24 h</a></b></div></div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="seccion">
        <div className="contenedor">
          <div className="sec-cab rv">
            <div>
              <span className="eyebrow">Rubros</span>
              <h2 className="display">Todo lo que tu auto o tu moto necesita</h2>
            </div>
            <p className="muted">Desde un filtro para el service hasta el kit de distribución completo. Si no figura en la web, preguntanos: trabajamos con pedidos a proveedores todos los días.</p>
          </div>
          <div className="cats rv">
            {cats.map((c, i) => (
              <Link key={c} href={`/catalogo?cat=${encodeURIComponent(c)}`} className="cat">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{c}</h3>
                <span className="cant">{porCat[c]} productos <span className="flecha"><Icono n="flecha" s={18} /></span></span>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 24 }} className="rv">
            <Link href="/catalogo" className="btn btn-borde">Ver el catálogo completo <Icono n="flecha" s={18} /></Link>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="seccion oscura">
        <div className="contenedor">
          <div className="sec-cab rv">
            <div>
              <span className="eyebrow" style={{ color: "#e05a5e" }}>Cómo comprar</span>
              <h2 className="display">Sin vueltas y sin esperar en el mostrador</h2>
            </div>
            <p className="muted">Pensado para el que viene apurado, para el mecánico que necesita varias piezas y para el que nos escribe fuera de horario.</p>
          </div>
          <div className="pasos">
            {[
              ["Buscá", "Por nombre, marca, código o modelo de vehículo. Ves al instante si hay stock."],
              ["Ubicá", "Cada repuesto indica pasillo, estante y lado. Abrí el mapa del local y andá directo."],
              ["Pedí", "Sumá lo que necesites a tu pedido y mandalo por WhatsApp, a cualquier hora."],
              ["Retirá", "Te confirmamos y lo dejamos separado en el mostrador. Pasás, pagás y listo."],
            ].map(([t, d], i) => (
              <div className="paso rv" key={t} style={{ ["--d" as string]: `${i * 0.1}s` }}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      {destacados.length > 0 && (
        <section className="seccion">
          <div className="contenedor">
            <div className="sec-cab rv">
              <div>
                <span className="eyebrow">En el local hoy</span>
                <h2 className="display">Los que más salen</h2>
              </div>
              <Link href="/catalogo" className="btn btn-borde">Ver todos <Icono n="flecha" s={18} /></Link>
            </div>
            <div className="grilla">
              {destacados.map((p, i) => <ProductoCard key={p.id} p={p} zona={zonas[p.zonaId]} i={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* MAPA */}
      <section className="seccion crema">
        <div className="contenedor mapa-home">
          <div className="plano-wrap rv">
            <Plano plano={plano} conteo={conteo} linkear />
          </div>
          <div className="rv" style={{ ["--d" as string]: ".1s" }}>
            <span className="eyebrow">Mapa del local</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,5vw,56px)", margin: "14px 0 16px" }}>Cada pasillo, cada estante</h2>
            <p className="muted" style={{ marginTop: 0 }}>Organizamos el local por rubros para que encuentres todo rápido. Tocá un sector para ver qué hay.</p>
            <ul className="lista-zonas">
              {pasillos.slice(0, 6).map((z) => (
                <li key={z.id}>
                  <Link href={`/mapa?zona=${z.id}`}>
                    <span className="cod" style={{ background: z.color }}>{z.codigo}</span>
                    <span><b>{z.nombre.replace(/^Pasillo\s+\w+\s*·\s*/i, "")}</b><small>{z.descripcion}</small></span>
                    <span className="cant">{conteo[z.id] || 0} ítems</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/mapa" className="btn">Abrir el mapa interactivo <Icono n="mapa" s={18} /></Link>
          </div>
        </div>
      </section>

      {/* TALLERES */}
      <section className="seccion">
        <div className="contenedor dos-col">
          <div className="rv">
            <span className="eyebrow">Para talleres y mecánicos</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,5vw,56px)", margin: "14px 0 18px" }}>Mandá la lista, nosotros la preparamos</h2>
            <p className="muted">Armá el pedido con todas las piezas del trabajo y envialo por WhatsApp. Te llega a nosotros con el código y la ubicación de cada repuesto, así lo separamos en minutos y te avisamos cuando está listo para retirar.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
              <Link href="/catalogo" className="btn btn-rojo">Empezar un pedido</Link>
              <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hola! Soy mecánico/taller y quería consultar por cuenta y pedidos.")}`} target="_blank" rel="noreferrer" className="btn btn-borde">Hablar con el local</a>
            </div>
          </div>
          <div className="valores rv" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              ["caja", "Pedido separado", "Lo dejamos listo en el mostrador con tu nombre."],
              ["llave", "Asesoramiento", "Te ayudamos a encontrar la pieza correcta por modelo y motor."],
              ["camion", "Pedidos a proveedor", "Si no está en stock, lo conseguimos."],
              ["escudo", "Primeras marcas", "Trabajamos marcas reconocidas y con garantía."],
            ].map(([ic, t, d]) => (
              <div className="valor" key={t}>
                <Icono n={ic as "caja"} s={26} />
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="marcas-tira" aria-label="Marcas con las que trabajamos">
        <div className="marcas-mov">
          {[...MARCAS, ...MARCAS].map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>

      {/* FAQ */}
      <section className="seccion">
        <div className="contenedor dos-col" style={{ alignItems: "start" }}>
          <div className="rv">
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="display" style={{ fontSize: "clamp(36px,5vw,56px)", margin: "14px 0 18px" }}>Lo que más nos consultan</h2>
            <p className="muted">¿Te queda otra duda? Escribinos por WhatsApp y te respondemos en horario de atención.</p>
          </div>
          <div className="faq rv">
            {[
              ["¿El stock de la web está actualizado?", "Sí, lo cargamos nosotros mismos desde el local. Igual, al enviar tu pedido te confirmamos disponibilidad y precio final antes de separarlo."],
              ["¿Puedo pedir fuera del horario de atención?", "Sí. Armá tu pedido en la web y mandalo por WhatsApp cuando quieras. Lo vemos a primera hora y te avisamos cuando está listo."],
              ["No encuentro el repuesto que necesito", "No todo el stock está publicado. Mandanos marca, modelo, año y motor del vehículo (o una foto de la pieza) y te decimos si lo tenemos o en cuánto lo conseguimos."],
              ["¿Cómo sé en qué pasillo está cada cosa?", "Cada producto muestra un cartel con la letra del pasillo y el número de estante. En el mapa del local ves dónde queda cada sector."],
              ["¿Hacen envíos?", config.envios ? config.textoEnvios : "Por el momento solo retiro en el local."],
              ["¿Qué medios de pago aceptan?", "Consultanos por WhatsApp las opciones vigentes de pago y promociones."],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final">
        <div className="contenedor">
          <h2 className="display rv">¿Lo necesitás hoy? Escribinos y te lo separamos.</h2>
          <p className="rv">{config.direccion}, {config.ciudad}. {hs.map((h) => `${h.dias}: ${h.horario}`).join(" · ")}</p>
          <div className="rv" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn" href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer"><Icono n="wa" s={18} /> WhatsApp</a>
            <Link className="btn btn-borde" href="/contacto">Cómo llegar</Link>
          </div>
        </div>
        <img src="/mascota.png" alt="" />
      </section>
    </>
  );
}
