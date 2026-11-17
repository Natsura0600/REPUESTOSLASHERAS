"use client";
import { useState } from "react";

export default function FormContacto({ whatsapp }: { whatsapp: string }) {
  const [d, setD] = useState({ nombre: "", vehiculo: "", consulta: "" });
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = `Hola! Soy ${d.nombre}.${d.vehiculo ? ` Vehículo: ${d.vehiculo}.` : ""}\n${d.consulta}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(t)}`, "_blank");
  };
  return (
    <form className="form-grid" onSubmit={enviar}>
      <div className="campo"><label>Nombre</label><input required value={d.nombre} onChange={set("nombre")} /></div>
      <div className="campo"><label>Vehículo</label><input value={d.vehiculo} onChange={set("vehiculo")} placeholder="Marca, modelo, año, motor" /></div>
      <div className="campo full"><label>Consulta</label><textarea required value={d.consulta} onChange={set("consulta")} placeholder="¿Qué repuesto buscás?" /></div>
      <div className="full"><button className="btn btn-wa" type="submit">Enviar por WhatsApp</button></div>
    </form>
  );
}
