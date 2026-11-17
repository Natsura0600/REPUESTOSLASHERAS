"use client";
import { useEffect, useState } from "react";
import { estadoLocal } from "@/lib/util";
import type { Config } from "@/lib/types";

export default function EstadoLocal({ config, className = "" }: { config: Config; className?: string }) {
  const [e, setE] = useState<{ abierto: boolean; texto: string } | null>(null);
  useEffect(() => {
    const f = () => setE(estadoLocal(config));
    f();
    const t = setInterval(f, 30_000);
    return () => clearInterval(t);
  }, [config]);
  if (!e) return <span className={`estado ${className}`} style={{ visibility: "hidden" }}><i />—</span>;
  return (
    <span className={`estado ${e.abierto ? "on" : ""} ${className}`}>
      <i /> {e.texto}
    </span>
  );
}
