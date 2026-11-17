import { sesionActual } from "@/lib/auth";
import { getConfig, getPlano } from "@/lib/store";
import ListaProductos from "./ListaProductos";

export default async function Productos({ searchParams }: { searchParams: Promise<{ stock?: string; falta?: string }> }) {
  const sp = await searchParams;
  const [plano, config, rol] = await Promise.all([getPlano(true), getConfig(true), sesionActual()]);
  return <ListaProductos plano={plano} categorias={config.categorias} rol={rol!} filtroStock={sp.stock || ""} falta={sp.falta || ""} />;
}
