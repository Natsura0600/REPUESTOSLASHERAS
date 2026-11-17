import Link from "next/link";
import type { Config } from "@/lib/types";
import { horarioResumen } from "@/lib/util";

export default function Footer({ config }: { config: Config }) {
  const hs = horarioResumen(config);
  return (
    <footer className="footer">
      <div className="contenedor">
        <div className="footer-grid">
          <div>
            <div className="footer-marca">
              <img src="/mascota.png" alt="" />
              <b>Repuestos<br />Las Heras</b>
            </div>
            <p style={{ maxWidth: 320, margin: 0 }}>{config.eslogan}. Atención personalizada y el repuesto justo para tu vehículo.</p>
          </div>
          <div>
            <h4>Sitio</h4>
            <ul>
              <li><Link href="/catalogo">Catálogo</Link></li>
              <li><Link href="/mapa">Mapa del local</Link></li>
              <li><Link href="/pedido">Mi pedido</Link></li>
              <li><Link href="/nosotros">Nosotros</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4>Horarios</h4>
            <ul>
              {hs.map((h) => (
                <li key={h.dias}><span style={{ color: "#fff" }}>{h.dias}</span><br />{h.horario}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>{config.direccion}, {config.ciudad}</li>
              <li><a href={`tel:${config.telefono.replace(/\D/g, "")}`}>{config.telefono}</a></li>
              <li><a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></li>
              {config.instagram ? <li><a href={config.instagram} target="_blank" rel="noreferrer">Instagram</a></li> : null}
              {config.linktree ? <li><a href={config.linktree} target="_blank" rel="noreferrer">Todos nuestros links</a></li> : null}
            </ul>
          </div>
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} {config.nombre} · {config.ciudad}</span>
          <span>Precios y stock sujetos a confirmación · <Link href="/admin">Acceso personal</Link></span>
        </div>
      </div>
    </footer>
  );
}
