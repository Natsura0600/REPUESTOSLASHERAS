import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { getPlano, getProductos } from "@/lib/store";
import EditorPlano from "./EditorPlano";

export default async function PlanoPag() {
  if ((await sesionActual()) !== "admin") redirect("/admin");
  const [plano, productos] = await Promise.all([getPlano(true), getProductos(true)]);
  const conteo: Record<string, number> = {};
  productos.forEach((p) => (conteo[p.zonaId] = (conteo[p.zonaId] || 0) + 1));
  return <EditorPlano inicial={plano} conteo={conteo} />;
}
