import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getProductos } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const base = `https://${h.get("host")}`;
  const productos = await getProductos();
  return [
    ...["", "/catalogo", "/mapa", "/nosotros", "/contacto"].map((p) => ({ url: base + p, changeFrequency: "weekly" as const })),
    ...productos.map((p) => ({ url: `${base}/producto/${p.id}`, lastModified: p.actualizado })),
  ];
}
