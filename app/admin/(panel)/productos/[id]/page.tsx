import { notFound } from "next/navigation";
import { datosSitio } from "@/lib/datos";
import { getConfig, getPlano, getProducto } from "@/lib/store";
import type { Producto } from "@/lib/types";
import EditorProducto from "./EditorProducto";

const VACIO: Producto = {
  id: "", nombre: "", marca: "", codigo: "", categoria: "", compatibilidad: "", descripcion: "", precio: null, mostrarPrecio: true,
  stock: "disponible", zonaId: "", estante: null, lado: "", nota: "", imagen: "", destacado: false, actualizado: "",
};

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plano, config, existente, { marcas }] = await Promise.all([getPlano(true), getConfig(true), id === "nuevo" ? null : getProducto(id, true), datosSitio()]);
  const p = id === "nuevo" ? VACIO : existente;
  if (!p) notFound();
  return <EditorProducto inicial={p} plano={plano} categorias={config.categorias} marcas={marcas} />;
}
