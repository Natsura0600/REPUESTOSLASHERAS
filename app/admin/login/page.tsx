"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
    const j = await r.json().catch(() => ({}));
    setCargando(false);
    if (r.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError(j.error || "No se pudo ingresar");
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="login">
      <form className={`login-card ${shake ? "shake" : ""}`} onSubmit={entrar}>
        <img src="/mascota.png" alt="" />
        <h1>Panel del local</h1>
        <p className="muted" style={{ textAlign: "center", marginTop: 0 }}>Acceso exclusivo para el personal</p>
        <div className="campo" style={{ margin: "22px 0 14px" }}>
          <label htmlFor="pass">Contraseña</label>
          <input id="pass" type="password" autoFocus autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required />
        </div>
        {error && <div className="alerta-box err">{error}</div>}
        <button className="btn btn-rojo" style={{ width: "100%" }} disabled={cargando}>{cargando ? "Verificando…" : "Ingresar"}</button>
        <p style={{ textAlign: "center", marginBottom: 0 }}><a href="/" className="muted" style={{ fontSize: 13 }}>← Volver al sitio</a></p>
      </form>
    </div>
  );
}
