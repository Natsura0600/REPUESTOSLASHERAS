import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { getConfig } from "@/lib/store";
import Ajustes from "./Ajustes";

export default async function AjustesPag() {
  if ((await sesionActual()) !== "admin") redirect("/admin");
  return <Ajustes inicial={await getConfig(true)} />;
}
