"use client";
import Link from "next/link";
import type { Plano as TPlano, Zona } from "@/lib/types";

interface Props {
  plano: TPlano;
  resaltar?: string | null; // id de zona
  estante?: number | null;
  conteo?: Record<string, number>;
  linkear?: boolean; // las zonas llevan a /mapa?zona=
  onZona?: (z: Zona) => void;
  compacto?: boolean;
}

const etiquetaTipo: Record<string, string> = {
  mostrador: "Mostrador", deposito: "Depósito", exhibidor: "Exhibidor", entrada: "Entrada", caja: "Caja", pasillo: "Pasillo",
};

// Recorta el texto para que entre en el sector (aprox. 0.36 unidades por letra)
function recortar(t: string, largo: number) {
  const max = Math.max(3, Math.floor(largo / 0.4));
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

export default function Plano({ plano, resaltar, estante, conteo, linkear, onZona, compacto }: Props) {
  const { ancho, alto, zonas } = plano;
  const pad = 1;
  return (
    <svg className="plano" viewBox={`${-pad} ${-pad} ${ancho + pad * 2} ${alto + pad * 2}`} role="img" aria-label="Plano del local">
      <defs>
        <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0H0V1" fill="none" stroke="#e9e2d4" strokeWidth="0.04" />
        </pattern>
        <pattern id="rayas" width="0.6" height="0.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.6" stroke="#bbb" strokeWidth="0.12" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={ancho} height={alto} fill="url(#grid)" stroke="#1c1a17" strokeWidth="0.15" rx="0.2" />
      {zonas.map((z) => {
        const hl = resaltar === z.id;
        const dim = resaltar && !hl;
        const esPasillo = z.tipo === "pasillo" || z.tipo === "exhibidor" || z.tipo === "mostrador";
        const vertical = z.h > z.w;
        const contenido = (
          <g className={`z ${hl ? "hl" : ""} ${dim ? "dim" : ""} ${linkear || onZona ? "link" : ""}`}>
            <rect
              className="r" x={z.x} y={z.y} width={z.w} height={z.h} rx="0.18"
              fill={z.tipo === "deposito" ? "url(#rayas)" : z.tipo === "entrada" ? "#fff" : z.color}
              fillOpacity={z.tipo === "deposito" || z.tipo === "entrada" ? 1 : hl ? 1 : 0.85}
              stroke={z.tipo === "entrada" ? "#1c1a17" : "rgba(0,0,0,.25)"} strokeWidth="0.06"
              strokeDasharray={z.tipo === "entrada" ? "0.3 0.2" : undefined}
            />
            {/* niveles de estante dibujados como líneas */}
            {z.tipo === "pasillo" && z.estantes > 1 && vertical &&
              Array.from({ length: Math.floor(z.h) - 1 }).map((_, i) => (
                <line key={i} x1={z.x + 0.25} x2={z.x + z.w - 0.25} y1={z.y + i + 1} y2={z.y + i + 1} stroke="rgba(255,255,255,.18)" strokeWidth="0.05" />
              ))}
            {z.codigo ? (
              <text x={z.x + z.w / 2} y={z.y + (vertical ? 1.6 : z.h / 2 + 0.1)} textAnchor="middle" dominantBaseline="middle"
                fill="#fff" fontFamily="var(--display)" fontWeight="700" fontSize={Math.min(z.w, 2.2) * 0.75}>
                {z.codigo}
              </text>
            ) : null}
            {!compacto && (
              <text
                x={z.x + z.w / 2} y={vertical ? z.y + 2.4 + (z.h - 2.4) / 2 : z.y + z.h / 2 + (z.codigo ? 0.95 : 0.1)}
                textAnchor="middle" dominantBaseline="middle"
                fill={z.tipo === "deposito" || z.tipo === "entrada" ? "#3a3631" : "rgba(255,255,255,.92)"}
                fontSize="0.6" fontWeight="600" letterSpacing="0.04"
                transform={vertical ? `rotate(-90 ${z.x + z.w / 2} ${z.y + 2.4 + (z.h - 2.4) / 2})` : undefined}
                style={{ textTransform: "uppercase" }}
              >
                {recortar(z.tipo === "pasillo" ? z.nombre.replace(/^Pasillo\s+\w+\s*·\s*/i, "") : z.codigo ? etiquetaTipo[z.tipo] : z.nombre, vertical ? z.h - 2.6 : z.w - 0.4)}
              </text>
            )}
            {conteo && conteo[z.id] ? (() => {
              const t = conteo[z.id] >= 1000 ? `${(conteo[z.id] / 1000).toFixed(conteo[z.id] >= 10000 ? 0 : 1).replace(".", ",")}k` : String(conteo[z.id]);
              const w = Math.max(1.24, t.length * 0.36 + 0.5);
              return (
                <g>
                  <rect x={z.x + z.w - w / 2} y={z.y - 0.62} width={w} height="1.24" rx="0.62" fill="#fff" stroke="#1c1a17" strokeWidth="0.06" />
                  <text x={z.x + z.w} y={z.y + 0.04} textAnchor="middle" dominantBaseline="middle" fontSize="0.55" fontWeight="700" fill="#1c1a17">{t}</text>
                </g>
              );
            })() : null}
            {hl && (
              <g>
                {(() => {
                  // ubicamos el pin a la altura del estante si es pasillo vertical
                  let px = z.x + z.w / 2;
                  let py = z.y + z.h / 2;
                  if (vertical && estante && z.estantes) {
                    const t = (estante - 0.5) / z.estantes;
                    py = z.y + z.h - t * z.h;
                  }
                  return (
                    <>
                      <circle className="radar" cx={px} cy={py} r="0.9" fill="none" stroke="#fff" strokeWidth="0.12" />
                      <g className="pin">
                        <path d={`M${px} ${py} l-0.7 -1.3 a0.85 0.85 0 1 1 1.4 0 z`} fill="#fff" stroke="#1c1a17" strokeWidth="0.08" />
                        <circle cx={px} cy={py - 1.62} r="0.3" fill="var(--rojo)" />
                      </g>
                    </>
                  );
                })()}
              </g>
            )}
          </g>
        );
        if (onZona) return <g key={z.id} onClick={() => onZona(z)}>{contenido}</g>;
        if (linkear && z.tipo !== "entrada" && z.tipo !== "deposito")
          return <Link key={z.id} href={`/mapa?zona=${z.id}`}>{contenido}</Link>;
        return <g key={z.id}>{contenido}</g>;
      })}
      <text x={ancho / 2} y={alto + 0.75} textAnchor="middle" fontSize="0.55" fill="#6e675d" letterSpacing="0.15">
        ↑ CALLE LAS HERAS
      </text>
    </svg>
  );
}

export function Leyenda({ plano }: { plano: TPlano }) {
  return (
    <div className="plano-ley">
      {plano.zonas
        .filter((z) => z.codigo)
        .map((z) => (
          <span key={z.id}>
            <i style={{ background: z.color }} /> {z.codigo} · {z.nombre.replace(/^Pasillo\s+\w+\s*·\s*/i, "")}
          </span>
        ))}
    </div>
  );
}
