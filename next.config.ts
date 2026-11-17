import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Incluir la carpeta /data en las funciones: es la copia inicial del catálogo
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
};

export default nextConfig;
