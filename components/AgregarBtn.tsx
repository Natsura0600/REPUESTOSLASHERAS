"use client";
import { useState } from "react";
import Icono from "./Icono";
import { pedido, type ItemPedido } from "./pedido";

export default function AgregarBtn({ item, grande }: { item: Omit<ItemPedido, "cant">; grande?: boolean }) {
  const [ok, setOk] = useState(false);
  const click = () => {
    pedido.agregar(item);
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  };
  if (grande)
    return (
      <button className="btn btn-rojo" onClick={click}>
        <Icono n={ok ? "check" : "carrito"} s={18} /> {ok ? "Agregado al pedido" : "Agregar al pedido"}
      </button>
    );
  return (
    <button className={`agregar ${ok ? "ok" : ""}`} onClick={click} aria-label={`Agregar ${item.nombre} al pedido`} title="Agregar al pedido">
      <Icono n={ok ? "check" : "mas"} s={18} />
    </button>
  );
}
