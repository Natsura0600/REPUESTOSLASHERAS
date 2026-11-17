type N =
  | "buscar" | "reloj" | "tel" | "pin" | "wa" | "carrito" | "mas" | "flecha" | "mapa" | "check" | "caja"
  | "escudo" | "llave" | "camion" | "qr" | "ig" | "link" | "menos" | "basura" | "lapiz" | "salir" | "ojo" | "subir" | "bajar";

const P: Record<N, React.ReactNode> = {
  buscar: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  tel: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  wa: <path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.4zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a4.5 4.5 0 0 1-2.3-2.3l.9-1-1-2z" />,
  carrito: <><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" /><circle cx="9.5" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></>,
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  flecha: <path d="M5 12h14m-5-5 5 5-5 5" />,
  mapa: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  caja: <><path d="m3 7.5 9-4.5 9 4.5v9L12 21l-9-4.5z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>,
  escudo: <><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  llave: <path d="M14.5 6.5a4 4 0 0 0 4.9 5.2l1.6 1.6-6.7 6.7a2.1 2.1 0 0 1-3-3l6.7-6.7-1.6-1.6A4 4 0 0 1 12 4.3L9 7.5 6.5 5 4 7.5 7 10.5l-3.3 3.2" />,
  camion: <><path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2" /></>,
  ig: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" /></>,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  basura: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  lapiz: <path d="m4 20 4-1L19.5 7.5a2.1 2.1 0 0 0-3-3L5 16zM14 6l3 3" />,
  salir: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  ojo: <><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></>,
  subir: <path d="M12 19V5m-6 6 6-6 6 6" />,
  bajar: <path d="M12 5v14m-6-6 6 6 6-6" />,
};

export default function Icono({ n, s = 20, className }: { n: N; s?: number; className?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {P[n]}
    </svg>
  );
}
