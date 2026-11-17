import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { getConfig, modificarConfig } from "@/lib/store";
import type { Config } from "@/lib/types";

export const GET = protegido(async () => NextResponse.json(await getConfig(true)));

export const PUT = protegido(async (_rol, req: Request) => {
  const c = (await req.json()) as Config;
  return NextResponse.json(
    await modificarConfig("actualizar ajustes", (prev) => ({
      ...prev,
      ...c,
      whatsapp: String(c.whatsapp || prev.whatsapp).replace(/\D/g, ""),
      categorias: (c.categorias || prev.categorias).map((x) => String(x).trim()).filter(Boolean),
    }))
  );
}, true);
