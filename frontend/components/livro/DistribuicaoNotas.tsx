"use client";

import { Star } from "lucide-react";
import type { ResumoAvaliacoes } from "@/lib/tipos";
import EstrelasNota from "@/components/ui/EstrelasNota";

// Nota da Comunidade com as 5 Barras
export default function DistribuicaoNotas({ resumo }: { resumo: ResumoAvaliacoes }) {
  if (resumo.total === 0 || !resumo.average) {
    return (
      <p className="text-[14px] text-suave">
        Nenhum leitor avaliou este livro ainda. Seja o primeiro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="shrink-0 text-center sm:w-[128px]">
        <div className="font-titulo text-[40px] font-bold leading-none tracking-[-0.03em]">
          {resumo.average.toFixed(1)}
        </div>
        <EstrelasNota nota={Math.round(resumo.average)} tamanho={15} className="mt-2" />
        <div className="mt-1.5 text-[12.5px] text-suave">
          {resumo.total.toLocaleString("pt-BR")}{" "}
          {resumo.total === 1 ? "avaliação" : "avaliações"}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {resumo.distribution.map((fatia) => (
          <div key={fatia.rating} className="flex items-center gap-2.5">
            <span className="flex w-[38px] shrink-0 items-center justify-end gap-0.5 text-[12.5px] tabular-nums text-suave">
              {fatia.rating}
              <Star size={11} className="fill-terracota text-terracota" />
            </span>
            <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-superficie-2">
              <span
                className="block h-full rounded-full bg-terracota transition-all duration-500"
                style={{ width: `${fatia.percentage}%` }}
              />
            </span>
            <span className="w-[54px] shrink-0 text-right text-[12px] tabular-nums text-suave-2">
              {fatia.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
