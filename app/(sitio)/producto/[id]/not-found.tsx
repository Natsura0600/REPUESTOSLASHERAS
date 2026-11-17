import Link from "next/link";
export default function NoEncontrado() {
  return (
    <div className="contenedor" style={{ padding: "80px 20px", textAlign: "center" }}>
      <img src="/mascota.png" alt="" style={{ width: 120, margin: "0 auto 16px" }} />
      <h1 className="display" style={{ fontSize: 48 }}>Este repuesto ya no está publicado</h1>
      <p className="muted">Puede que se haya agotado o cambiado de código.</p>
      <Link href="/catalogo" className="btn btn-rojo">Volver al catálogo</Link>
    </div>
  );
}
