"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Icono from "@/components/Icono";
import type { Zona } from "@/lib/types";

export default function Carteles({ zonas }: { zonas: Zona[] }) {
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");
  useEffect(() => {
    const base = window.location.origin;
    Promise.all(zonas.map(async (z) => [z.id, await QRCode.toDataURL(`${base}/mapa?zona=${z.id}`, { margin: 1, width: 400 })] as const)).then((l) => setQrs(Object.fromEntries(l)));
    QRCode.toDataURL(`${base}/`, { margin: 1, width: 400 }).then(setGeneral);
  }, [zonas]);
  return (
    <>
      <div className="adm-cab">
        <div><h1>Carteles con QR</h1><p>Imprimilos y pegalos en la cabecera de cada pasillo. El cliente escanea y ve todo lo que hay en ese sector y en qué estante.</p></div>
        <button className="btn btn-rojo no-print" onClick={() => window.print()}><Icono n="qr" s={18} /> Imprimir</button>
      </div>
      <div className="cartel-qr">
        <div className="letra" style={{ background: "var(--rojo)", fontSize: 40 }}>WEB</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div><b className="display" style={{ fontSize: 30 }}>¿Buscás algo?</b><p style={{ margin: "6px 0 0" }}>Escaneá y buscá en todo nuestro stock. Armá tu pedido y te lo preparamos.</p></div>
          {general && <img className="qr" src={general} alt="QR al sitio" />}
        </div>
      </div>
      {zonas.map((z) => (
        <div className="cartel-qr" key={z.id}>
          <div className="letra" style={{ background: z.color }}>{z.codigo}</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <b className="display" style={{ fontSize: 30, lineHeight: 1 }}>{z.nombre.replace(/^Pasillo\s+\w+\s*·\s*/i, "")}</b>
              <p style={{ margin: "6px 0 0", fontSize: 14 }}>{z.descripcion}</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>Escaneá para ver qué hay en cada estante</p>
            </div>
            {qrs[z.id] && <img className="qr" src={qrs[z.id]} alt={`QR ${z.codigo}`} />}
          </div>
        </div>
      ))}
    </>
  );
}
