import type { Zona } from "@/lib/types";

export default function Estanteria({ zona, estante, lado }: { zona: Zona; estante: number | null; lado: string }) {
  const n = Math.max(zona.estantes || 1, 1);
  return (
    <div>
      <div className="estanteria" style={{ ["--zc" as string]: zona.color }}>
        {Array.from({ length: n }).map((_, i) => {
          const nivel = i + 1;
          const on = estante === nivel;
          return (
            <div key={nivel} className={`nivel ${on ? "on" : ""}`}>
              <span>Estante {nivel}</span>
              {on && lado ? <span className="lado-marca">{lado === "izq" ? "← izquierda" : "derecha →"}</span> : null}
              {on && !lado ? <span className="lado-marca">acá</span> : null}
            </div>
          );
        })}
      </div>
      <small className="muted" style={{ display: "block", marginTop: 6, fontSize: 12 }}>
        El estante 1 es el de abajo. Izquierda y derecha, mirando el pasillo desde la entrada del local.
      </small>
    </div>
  );
}
