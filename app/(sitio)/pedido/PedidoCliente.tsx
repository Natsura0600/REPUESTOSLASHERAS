"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Icono from "@/components/Icono";
import { pedido, usePedido } from "@/components/pedido";

const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function PedidoCliente({ whatsapp, envios, textoEnvios }: { whatsapp: string; envios: boolean; textoEnvios: string }) {
  const items = usePedido();
  const [nombre, setNombre] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [entrega, setEntrega] = useState<"retiro" | "envio">("retiro");
  const [nota, setNota] = useState("");

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("rlh_cliente") || "{}");
      if (d.nombre) setNombre(d.nombre);
    } catch {}
  }, []);

  const total = items.reduce((a, b) => a + (b.precio ? b.precio * b.cant : 0), 0);
  const sinPrecio = items.some((i) => !i.precio);

  const mensaje = useMemo(() => {
    const l: string[] = [];
    l.push(`*Pedido web · Repuestos Las Heras*`);
    if (nombre) l.push(`Cliente: ${nombre}`);
    if (vehiculo) l.push(`Vehículo: ${vehiculo}`);
    l.push(`Entrega: ${entrega === "retiro" ? "Retiro en el local" : "Envío a domicilio"}`);
    l.push("");
    items.forEach((i, n) => {
      l.push(`${n + 1}) ${i.cant} x ${i.nombre} – ${i.marca}`);
      l.push(`   Cód: ${i.codigo || "-"}${i.precio ? ` · ${fmt(i.precio)} c/u` : " · a consultar"}`);
      if (i.ubic) l.push(`   📍 ${i.ubic}`);
    });
    l.push("");
    if (total) l.push(`Total estimado: ${fmt(total)}${sinPrecio ? " + ítems a consultar" : ""}`);
    if (nota) l.push(`Nota: ${nota}`);
    l.push(`¿Me confirman disponibilidad? Gracias!`);
    return l.join("\n");
  }, [items, nombre, vehiculo, entrega, nota, total, sinPrecio]);

  const enviar = () => {
    try { localStorage.setItem("rlh_cliente", JSON.stringify({ nombre })); } catch {}
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  if (!items.length)
    return (
      <div className="vacio" style={{ margin: "40px 0 80px" }}>
        <img src="/mascota.png" alt="" />
        <h3 style={{ margin: "0 0 6px" }}>Tu pedido está vacío</h3>
        <p className="muted" style={{ margin: "0 0 18px" }}>Buscá los repuestos que necesitás y sumalos con el botón “+”.</p>
        <Link href="/catalogo" className="btn btn-rojo">Ir al catálogo</Link>
      </div>
    );

  return (
    <div className="pedido-layout">
      <div>
        {items.map((i) => (
          <div className="pedido-item" key={i.id}>
            <div className="mini">{i.imagen ? <img src={`/api/img/${i.imagen}`} alt="" /> : <Icono n="caja" s={28} />}</div>
            <div>
              <Link href={`/producto/${i.id}`} style={{ textDecoration: "none", fontWeight: 600 }}>{i.nombre}</Link>
              <div className="muted" style={{ fontSize: 13 }}>{i.marca} · {i.codigo} {i.ubic ? `· ${i.ubic}` : ""}</div>
              <div style={{ fontSize: 14, marginTop: 4, fontWeight: 600 }}>{i.precio ? fmt(i.precio * i.cant) : "Precio a consultar"}</div>
            </div>
            <div className="cant-ctrl">
              <button onClick={() => pedido.cambiar(i.id, i.cant - 1)} aria-label="Restar">{i.cant === 1 ? <Icono n="basura" s={15} /> : <Icono n="menos" s={15} />}</button>
              <span>{i.cant}</span>
              <button onClick={() => pedido.cambiar(i.id, i.cant + 1)} aria-label="Sumar"><Icono n="mas" s={15} /></button>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Link href="/catalogo" className="btn btn-borde btn-chico">+ Seguir agregando</Link>
          <button className="btn btn-borde btn-chico" onClick={() => confirm("¿Vaciar el pedido?") && pedido.vaciar()}>Vaciar</button>
        </div>
      </div>
      <aside className="resumen">
        <h3>Datos para el pedido</h3>
        <div className="campo"><label>Tu nombre</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Para separarlo a tu nombre" /></div>
        <div className="campo"><label>Vehículo (opcional)</label><input value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} placeholder="Ej: Gol Trend 1.6 2014" /></div>
        <div className="campo">
          <label>Entrega</label>
          <select value={entrega} onChange={(e) => setEntrega(e.target.value as "retiro")}>
            <option value="retiro">Retiro en el local</option>
            {envios && <option value="envio">Envío a domicilio</option>}
          </select>
          {entrega === "envio" && <small>{textoEnvios}</small>}
        </div>
        <div className="campo"><label>Nota (opcional)</label><textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: paso a las 18 hs" /></div>
        {total > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="muted">Total estimado</span><span className="precio">{fmt(total)}</span>
          </div>
        )}
        <details>
          <summary className="muted" style={{ cursor: "pointer", fontSize: 13 }}>Ver el mensaje que se envía</summary>
          <div className="ticket" style={{ marginTop: 8 }}>{mensaje}</div>
        </details>
        <button className="btn btn-wa" onClick={enviar}><Icono n="wa" s={18} /> Enviar pedido por WhatsApp</button>
        <small className="muted" style={{ fontSize: 12 }}>Los precios son de referencia; te confirmamos el total antes de separarlo.</small>
      </aside>
    </div>
  );
}
