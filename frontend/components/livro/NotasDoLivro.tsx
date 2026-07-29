"use client";

import type { ReactNode } from "react";
import type { LivroResumo } from "@/lib/tipos";
import EstrelasNota from "@/components/ui/EstrelasNota";

// Procurar Se o Livro Tem Notas pra Exibir
export function temNota(livro: LivroResumo): boolean {
  return Boolean(livro.communityRating) || Boolean(livro.averageRating);
}

// Nota dos Leitores Daqui e a Importada do Google, Lado a Lado
export default function NotasDoLivro({
  livro,
  compacto = false,
  semNota = <span className="text-[12px] text-suave-2">—</span>,
}: {
  livro: LivroResumo;
  compacto?: boolean;
  // Cada Tela Decide o que Aparece no Lugar da Nota Ausente
  semNota?: ReactNode;
}) {
  const comunidade = livro.communityRating;
  const google = livro.averageRating;

  if (!comunidade && !google) {
    return <>{semNota}</>;
  }

  const tamanho = compacto ? 12 : 13;

  return (
    <span className={`flex flex-wrap items-center ${compacto ? "gap-x-2 gap-y-0.5" : "gap-2.5"}`}>
      {comunidade ? (
        <span className="flex items-center gap-1.5" title="Nota dos leitores daqui">
          <EstrelasNota nota={Math.round(comunidade)} tamanho={tamanho} />
          <span className="text-[11.5px] font-semibold tabular-nums text-tinta-2">
            {comunidade.toFixed(1)}
          </span>
          {livro.communityRatingsCount ? (
            <span className="text-[11px] text-suave-2">
              ({livro.communityRatingsCount})
            </span>
          ) : null}
        </span>
      ) : null}

      {google ? (
        <span
          className="flex items-center gap-1 text-[11px] text-suave-2"
          title="Nota no Google Books"
        >
          {comunidade ? null : (
            <EstrelasNota nota={Math.round(google)} tamanho={tamanho} className="opacity-70" />
          )}
          <span className="tabular-nums">{google.toFixed(1)}</span>
          <span>Google</span>
        </span>
      ) : null}
    </span>
  );
}
