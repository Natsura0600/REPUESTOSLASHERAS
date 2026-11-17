import type { Metadata } from "next";
import EstadoLocal from "@/components/EstadoLocal";
import Icono from "@/components/Icono";
import { getConfig } from "@/lib/store";
import { DIAS } from "@/lib/util";
import FormContacto from "./FormContacto";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contacto y horarios" };

export default async function Contacto() {
  const config = await getConfig();
  const dir = `${config.direccion}, ${config.ciudad}`;
  const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDay();
  return (
    <>
      <section className="pag-cab">
        <div className="contenedor">
          <span className="eyebrow">Contacto</span>
          <h1 className="display">Estamos en Las Heras 766</h1>
          <p><EstadoLocal config={config} /></p>
        </div>
        <img className="marca-agua" src="/mascota.png" alt="" />
      </section>
      <section className="seccion" style={{ paddingTop: 56 }}>
        <div className="contenedor contacto-grid">
          <div className="rv">
            <div className="dato"><Icono n="pin" s={24} /><div><small>Dirección</small><b><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}`} target="_blank" rel="noreferrer">{dir}</a></b></div></div>
            <div className="dato"><Icono n="tel" s={24} /><div><small>Teléfono</small><b><a href={`tel:${config.telefono.replace(/\D/g, "")}`}>{config.telefono}</a></b></div></div>
            <div className="dato"><Icono n="wa" s={24} /><div><small>WhatsApp</small><b><a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer">Escribinos</a></b></div></div>
            {config.instagram ? <div className="dato"><Icono n="ig" s={24} /><div><small>Instagram</small><b><a href={config.instagram} target="_blank" rel="noreferrer">Seguinos</a></b></div></div> : null}
            {config.linktree ? <div className="dato"><Icono n="link" s={24} /><div><small>Links</small><b><a href={config.linktree} target="_blank" rel="noreferrer">Todos nuestros links</a></b></div></div> : null}
            <div className="dato" style={{ display: "block" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}><Icono n="reloj" s={24} /><small style={{ marginTop: 4 }}>Horarios</small></div>
              <table className="horarios-tabla"><tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const rs = config.horarios[String(d)] || [];
                  return <tr key={d} className={d === hoy ? "hoy" : ""}><td>{DIAS[d]}{d === hoy ? " (hoy)" : ""}</td><td>{rs.length ? rs.map((r) => `${r.desde} a ${r.hasta}`).join(" / ") : "Cerrado"}</td></tr>;
                })}
              </tbody></table>
            </div>
          </div>
          <div className="rv" style={{ ["--d" as string]: ".1s", display: "flex", flexDirection: "column", gap: 24 }}>
            <iframe className="mapa-google" title="Ubicación en Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(dir)}&output=embed`} />
            <div className="plano-wrap" style={{ padding: 24 }}>
              <h3 className="display" style={{ fontSize: 30, margin: "0 0 6px" }}>Dejanos tu consulta</h3>
              <p className="muted" style={{ marginTop: 0 }}>Se abre WhatsApp con el mensaje listo para enviar.</p>
              <FormContacto whatsapp={config.whatsapp} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
