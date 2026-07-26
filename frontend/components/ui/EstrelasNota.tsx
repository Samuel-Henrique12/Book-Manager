"use client";

import { Star } from "lucide-react";

// Nota de 1 ~ 5 Estrelas
export default function EstrelasNota({
  nota,
  tamanho = 14,
  aoAvaliar,
  className = "",
}: {
  nota: number | null;
  tamanho?: number;
  aoAvaliar?: (nota: number) => void;
  className?: string;
}) {
  const valor = nota ?? 0;
  const interativa = typeof aoAvaliar === "function";

  const estrelas = [1, 2, 3, 4, 5].map((n) => {
    const preenchida = n <= valor;
    const icone = (
      <Star
        size={tamanho}
        strokeWidth={1.8}
        className={preenchida ? "fill-terracota text-terracota" : "text-borda-forte"}
      />
    );

    if (!interativa) return <span key={n}>{icone}</span>;

    return (
      <button
        key={n}
        type="button"
        onClick={() => aoAvaliar(n)}
        aria-label={`Dar nota ${n}`}
        className="cursor-pointer transition hover:scale-110"
      >
        {icone}
      </button>
    );
  });

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interativa ? undefined : "img"}
      aria-label={interativa ? undefined : nota ? `Nota ${valor} de 5` : "Sem avaliação"}
    >
      {estrelas}
    </span>
  );
}
