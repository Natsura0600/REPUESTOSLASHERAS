"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Activa las animaciones de aparición (.rv) cuando los elementos entran en pantalla. */
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("visto"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    const observar = () => document.querySelectorAll(".rv:not(.visto)").forEach((el) => io.observe(el));
    observar();
    const mo = new MutationObserver(observar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [path]);
  return null;
}
