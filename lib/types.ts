export type Stock = "disponible" | "pocas" | "consultar" | "sin";

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  codigo: string; // código / SKU interno o del fabricante
  categoria: string;
  compatibilidad: string; // "Fiat Palio 1.4 / Siena / Uno Fire"
  descripcion: string;
  precio: number | null;
  mostrarPrecio: boolean;
  stock: Stock;
  zonaId: string; // pasillo / góndola / mostrador
  estante: number | null; // nivel (1 = abajo)
  lado: "" | "izq" | "der";
  nota: string; // "caja azul, al fondo"
  imagen: string; // nombre de archivo en data/img
  destacado: boolean;
  actualizado: string; // ISO
}

export type TipoZona = "pasillo" | "mostrador" | "deposito" | "exhibidor" | "entrada" | "caja";

export interface Zona {
  id: string;
  tipo: TipoZona;
  codigo: string; // "A", "B", "M"...
  nombre: string;
  descripcion: string;
  x: number;
  y: number;
  w: number;
  h: number;
  estantes: number;
  color: string;
}

export interface Plano {
  ancho: number;
  alto: number;
  zonas: Zona[];
}

export interface Rango {
  desde: string; // "08:00"
  hasta: string; // "12:30"
}

export interface Config {
  nombre: string;
  eslogan: string;
  telefono: string;
  whatsapp: string; // formato internacional sin +: 5492323583100
  direccion: string;
  ciudad: string;
  instagram: string;
  linktree: string;
  email: string;
  // 0 = domingo ... 6 = sábado
  horarios: Record<string, Rango[]>;
  aviso: string; // banner superior (vacío = oculto)
  categorias: string[];
  feriados: string[]; // fechas YYYY-MM-DD cerradas
  envios: boolean;
  textoEnvios: string;
  anioFundacion: string;
}

export type Rol = "admin" | "empleado";
