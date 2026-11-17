import type { Metadata } from "next";
import { getConfig } from "@/lib/store";
import PedidoCliente from "./PedidoCliente";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi pedido" };

export default async function Pedido() {
  const config = await getConfig();
  return (
    <>
      <section className="pag-cab">
        <div className="contenedor">
          <span className="eyebrow">Mi pedido</span>
          <h1 className="display">Armalo y mandalo</h1>
          <p>Te llega a nuestro WhatsApp con el código y la ubicación de cada repuesto. Lo separamos y te avisamos cuando está listo.</p>
        </div>
        <img className="marca-agua" src="/mascota.png" alt="" />
      </section>
      <div className="contenedor">
        <PedidoCliente whatsapp={config.whatsapp} envios={config.envios} textoEnvios={config.textoEnvios} />
      </div>
    </>
  );
}
