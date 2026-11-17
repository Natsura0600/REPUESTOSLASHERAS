"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icono from "@/components/Icono";
import type { Rol } from "@/lib/types";

export default function Sidebar({ rol }: { rol: Rol }) {
  const path = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => setAbierto(false), [path]);
  const links = [
    { href: "/admin", t: "Resumen", i: "ojo" as const },
    { href: "/admin/productos", t: "Productos", i: "caja" as const },
    { href: "/admin/productos/nuevo", t: "Cargar producto", i: "mas" as const },
    ...(rol === "admin"
      ? [
          { href: "/admin/plano", t: "Plano y pasillos", i: "mapa" as const },
          { href: "/admin/carteles", t: "Carteles con QR", i: "qr" as const },
          { href: "/admin/ajustes", t: "Datos del local", i: "llave" as const },
        ]
      : []),
  ];
  const salir = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };
  return (
    <>
      <div className="adm-top-movil">
        <b className="display" style={{ fontSize: 20 }}>Panel · Las Heras</b>
        <button className={`burger ${abierto ? "abierto" : ""}`} onClick={() => setAbierto(!abierto)} aria-label="Menú"><span /><span /><span /></button>
      </div>
      <aside className={`adm-side ${abierto ? "abierto" : ""}`}>
        <Link href="/admin" className="marca">
          <img src="/mascota.png" alt="" style={{ height: 42 }} />
          <span className="marca-txt"><b>Las Heras</b><span>Panel · {rol === "admin" ? "Dueño" : "Empleado"}</span></span>
        </Link>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? "on" : ""}><Icono n={l.i} s={18} /> {l.t}</Link>
        ))}
        <div className="pie">
          <a href="/" target="_blank"><Icono n="link" s={18} /> Ver el sitio</a>
          <button className="lnk" onClick={salir}><Icono n="salir" s={18} /> Cerrar sesión</button>
        </div>
      </aside>
    </>
  );
}
