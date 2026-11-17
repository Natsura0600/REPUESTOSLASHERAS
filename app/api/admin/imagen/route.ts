import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { guardarImagen } from "@/lib/store";
import { slug } from "@/lib/util";

// Recibe la imagen ya comprimida en el navegador (webp ~100 KB) en base64
export const POST = protegido(async (_rol, req: Request) => {
  const { data, nombre } = await req.json();
  const m = /^data:image\/(webp|jpeg|png);base64,(.+)$/.exec(String(data || ""));
  if (!m) throw new Error("Formato de imagen no válido");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 2_000_000) throw new Error("La imagen es demasiado grande (máx. 2 MB)");
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const archivo = `${slug(String(nombre || "foto")).slice(0, 40) || "foto"}-${Date.now().toString(36)}.${ext}`;
  await guardarImagen(archivo, buf);
  return NextResponse.json({ archivo });
});
