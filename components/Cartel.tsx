import type { Zona } from "@/lib/types";

export default function Cartel({ zona, estante }: { zona?: Zona; estante?: number | null }) {
  if (!zona) return null;
  return (
    <span className="cartel" style={{ ["--zc" as string]: zona.color }}>
      <span className="c">{zona.codigo || "•"}</span>
      <span className="t">{zona.tipo === "pasillo" ? "Pasillo" : zona.nombre}{estante ? ` · Est. ${estante}` : ""}</span>
    </span>
  );
}
