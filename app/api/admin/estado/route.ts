import { NextResponse } from "next/server";
import { protegido } from "@/lib/api";
import { usaGitHub } from "@/lib/store";

export const GET = protegido(async (rol) =>
  NextResponse.json({
    rol,
    guardado: usaGitHub ? "github" : process.env.VERCEL ? "sin-configurar" : "local",
    repo: usaGitHub ? process.env.GITHUB_REPO : null,
  })
);
