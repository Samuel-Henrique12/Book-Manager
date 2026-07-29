"use client";

import type { LucideIcon } from "lucide-react";

// Numero da Estante; Vira Filtro Quando Recebe onClick
export default function Metrica({
  Icone,
  valor,
  rotulo,
  destaque = false,
  ativa = false,
  onClick,
}: {
  Icone: LucideIcon;
  valor?: number;
  rotulo: string;
  destaque?: boolean;
  ativa?: boolean;
  onClick?: () => void;
}) {
  const conteudo = (
    <>
      {/* Fio de Acento: Marca o Filtro Ativo */}
      {ativa && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-terracota"
        />
      )}

      <Icone
        size={17}
        strokeWidth={1.9}
        className={ativa || destaque ? "text-terracota" : "text-suave-2"}
      />

      <span
        className={`mt-2 block font-titulo text-[23px] font-bold leading-none tabular-nums tracking-[-0.02em] ${
          ativa ? "text-terracota" : ""
        }`}
      >
        {valor?.toLocaleString("pt-BR") ?? "—"}
      </span>
      <span className={`mt-1 block text-[12.5px] ${ativa ? "text-tinta-2" : "text-suave"}`}>
        {rotulo}
      </span>
    </>
  );

  const base = "relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition";

  // Ativo e Claro com Acento
  const cor = ativa
    ? "border-terracota/60 bg-superficie shadow-[0_10px_26px_-18px_rgba(196,71,43,0.75)]"
    : destaque
      ? "border-terracota/25 bg-terracota-lavagem"
      : "border-borda bg-superficie";

  if (!onClick) {
    return <div className={`${base} ${cor}`}>{conteudo}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      title={ativa ? `Remover filtro: ${rotulo}` : `Filtrar por ${rotulo}`}
      className={`${base} ${cor} w-full ${
        ativa ? "" : "hover:border-borda-forte hover:shadow-[0_10px_24px_-18px_rgba(60,45,20,0.5)]"
      }`}
    >
      {conteudo}
    </button>
  );
}
