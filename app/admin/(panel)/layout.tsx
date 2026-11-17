import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import Sidebar from "./Sidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const rol = await sesionActual();
  if (!rol) redirect("/admin/login");
  return (
    <div className="adm">
      <Sidebar rol={rol} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
