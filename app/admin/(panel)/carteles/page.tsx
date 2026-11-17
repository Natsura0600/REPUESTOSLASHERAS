import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import { getPlano } from "@/lib/store";
import Carteles from "./Carteles";

export default async function CartelesPag() {
  if ((await sesionActual()) !== "admin") redirect("/admin");
  const plano = await getPlano(true);
  return <Carteles zonas={plano.zonas.filter((z) => z.codigo)} />;
}
