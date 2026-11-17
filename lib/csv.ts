// CSV simple compatible con Excel en español (separador ; y BOM UTF-8)
export function aCSV(filas: (string | number | boolean | null)[][]) {
  const esc = (v: string | number | boolean | null) => {
    const s = v === null ? "" : String(v);
    return /[;"\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + filas.map((f) => f.map(esc).join(";")).join("\r\n");
}

export function leerCSV(texto: string): string[][] {
  texto = texto.replace(/^﻿/, "");
  const primera = texto.split(/\r?\n/)[0] || "";
  const sep = (primera.match(/;/g) || []).length >= (primera.match(/,/g) || []).length ? ";" : ",";
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x.trim())) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  fila.push(campo);
  if (fila.some((x) => x.trim())) filas.push(fila);
  return filas;
}
