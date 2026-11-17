"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icono from "./Icono";
import EstadoLocal from "./EstadoLocal";
import { usePedido } from "./pedido";
import type { Config } from "@/lib/types";

const LINKS = [
  { href: "/", t: "Inicio" },
  { href: "/catalogo", t: "Catálogo" },
  { href: "/mapa", t: "Mapa del local" },
  { href: "/nosotros", t: "Nosotros" },
  { href: "/contacto", t: "Contacto" },
];

export default function Header({ config }: { config: Config }) {
  const path = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = usePedido();
  const total = items.reduce((a, b) => a + b.cant, 0);
  const prev = useRef(total);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setAbierto(false), [path]);
  useEffect(() => {
    if (total > prev.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      prev.current = total;
      return () => clearTimeout(t);
    }
    prev.current = total;
  }, [total]);

  return (
    <>
      {config.aviso ? <div className="aviso">{config.aviso}</div> : null}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="contenedor header-in">
          <Link href="/" className="marca" aria-label="Inicio">
            <img src="/mascota.png" alt="" width={34} height={50} />
            <span className="marca-txt">
              <b>Repuestos Las Heras</b>
              <span>Luján · Autos y motos</span>
            </span>
          </Link>
          <nav className={`nav ${abierto ? "abierto" : ""}`}>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
                {l.t}
              </Link>
            ))}
          </nav>
          <div className="header-acc">
            <EstadoLocal config={config} />
            <Link href="/pedido" className="carrito-btn" aria-label="Ver mi pedido">
              <Icono n="carrito" s={18} />
              <span className="sr">Pedido</span>
              <span className={`num ${pop ? "pop" : ""}`}>{total}</span>
            </Link>
            <button className={`burger ${abierto ? "abierto" : ""}`} onClick={() => setAbierto(!abierto)} aria-label="Menú">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
