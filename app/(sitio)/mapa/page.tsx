import type { Metadata } from "next";
import { datosSitio } from "@/lib/datos";
import { getProducto } from "@/lib/store";
import MapaInteractivo from "./MapaInteractivo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mapa del local" };

export default async function Mapa({ searchParams }: { searchParams: Promise<{ zona?: string; p?: string }> }) {
  const sp = await searchParams;
  const { plano, conteo } = await datosSitio();
  const pi = sp.p ? await getProducto(sp.p) : undefined;
  return (
    <>
      <section className="pag-cab">
        <div className="contenedor">
          <span className="eyebrow">Mapa del local</span>
          <h1 className="display">Encontralo sin preguntar</h1>
          <p>Tocá un pasillo para ver qué hay y en qué estante. Si estás en el local, escaneá el QR del cartel de cada pasillo.</p>
        </div>
        <img className="marca-agua" src="/mascota.png" alt="" />
      </section>
      <div className="contenedor" style={{ padding: "32px 20px 80px" }}>
        <MapaInteractivo plano={plano} conteo={conteo} inicial={sp.zona || null} productoInicial={pi ? { id: pi.id, zonaId: pi.zonaId, estante: pi.estante } : null} />
      </div>
    </>
  );
}
