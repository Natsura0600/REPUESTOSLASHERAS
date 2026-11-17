import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icono from "@/components/Icono";
import Reveal from "@/components/Reveal";
import { getConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig();
  return (
    <>
      <Header config={config} />
      <main>{children}</main>
      <Footer config={config} />
      <a className="wa-flot" href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hola! Les escribo desde la web, quería consultar por un repuesto.")}`} target="_blank" rel="noreferrer" aria-label="Escribinos por WhatsApp">
        <Icono n="wa" s={28} />
        <span className="tip">¿Lo buscás y no lo encontrás? Escribinos</span>
      </a>
      <Reveal />
    </>
  );
}
