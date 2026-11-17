import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"
  ),
  title: { default: 'Repuestos "Las Heras" · Repuestos para autos y motos en Luján', template: '%s · Repuestos "Las Heras"' },
  description:
    "Repuestos para autos y motos en Luján. Buscá el repuesto, mirá en qué pasillo está y armá tu pedido por WhatsApp. Las Heras 766, Luján.",
  openGraph: { images: ["/logo-full.png"], locale: "es_AR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#a3262a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
