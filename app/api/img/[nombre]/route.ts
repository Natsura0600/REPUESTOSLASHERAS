import { leerImagen } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const { nombre } = await params;
  const buf = await leerImagen(nombre).catch(() => null);
  if (!buf) return new Response("No encontrada", { status: 404 });
  const ext = nombre.split(".").pop()!.toLowerCase();
  const tipo = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": tipo,
      // El nombre del archivo cambia con cada subida, así que se puede cachear "para siempre"
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
