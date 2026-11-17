"use client";
import { useSyncExternalStore } from "react";

export interface ItemPedido {
  id: string;
  nombre: string;
  marca: string;
  codigo: string;
  precio: number | null;
  imagen: string;
  ubic: string; // "Pasillo A · estante 3"
  cant: number;
}

const KEY = "rlh_pedido_v1";
const subs = new Set<() => void>();
let cacheStr = "";
let cache: ItemPedido[] = [];
const VACIO: ItemPedido[] = [];

function leer(): ItemPedido[] {
  try {
    const s = localStorage.getItem(KEY) || "[]";
    if (s !== cacheStr) {
      cacheStr = s;
      cache = JSON.parse(s);
    }
    return cache;
  } catch {
    return VACIO;
  }
}
function guardar(items: ItemPedido[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  subs.forEach((f) => f());
}

export const pedido = {
  agregar(item: Omit<ItemPedido, "cant">, cant = 1) {
    const items = [...leer()];
    const i = items.findIndex((x) => x.id === item.id);
    if (i >= 0) items[i] = { ...items[i], cant: items[i].cant + cant };
    else items.push({ ...item, cant });
    guardar(items);
  },
  cambiar(id: string, cant: number) {
    guardar(leer().map((x) => (x.id === id ? { ...x, cant } : x)).filter((x) => x.cant > 0));
  },
  vaciar() {
    guardar([]);
  },
};

export function usePedido() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      const onStorage = (e: StorageEvent) => e.key === KEY && f();
      window.addEventListener("storage", onStorage);
      return () => {
        subs.delete(f);
        window.removeEventListener("storage", onStorage);
      };
    },
    leer,
    () => VACIO
  );
}
