"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useState } from "react";

// Rolagem Lateral (Scroll) sem Barra
export default function TrilhoRolavel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [temAntes, setTemAntes] = useState(false);
  const [temDepois, setTemDepois] = useState(false);

  const medir = useCallback(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const restante = trilho.scrollWidth - trilho.clientWidth - trilho.scrollLeft;
    setTemAntes(trilho.scrollLeft > 4);
    setTemDepois(restante > 4);
  }, []);

  // Conteudo Muda de Tamanho Conforme os Filtros Carregam
  useEffect(() => {
    medir();
    const trilho = trilhoRef.current;
    if (!trilho) return;

    const observador = new ResizeObserver(medir);
    observador.observe(trilho);
    Array.from(trilho.children).forEach((filho) => observador.observe(filho));

    window.addEventListener("resize", medir);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [medir, children]);

  return (
    <div className={`relative -mx-5 sm:mx-0 ${className}`}>
      {temAntes && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-papel to-transparent"
        />
      )}
      {temDepois && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-papel to-transparent"
        />
      )}

      <div
        ref={trilhoRef}
        onScroll={medir}
        className="overflow-x-auto px-5 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-2 pb-1">{children}</div>
      </div>
    </div>
  );
}
