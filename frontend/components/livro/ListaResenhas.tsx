"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { listarResenhas } from "@/lib/avaliacoes";
import { iniciais } from "@/lib/spines";
import EstrelasNota from "@/components/ui/EstrelasNota";
import TextoComSpoiler from "@/components/ui/TextoComSpoiler";
import Paginacao from "@/components/Paginacao";

// Resenhas Escritas pelos Leitores
export default function ListaResenhas({ livroId }: { livroId: number }) {
  const [pagina, setPagina] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ["resenhas", livroId, pagina],
    queryFn: () => listarResenhas(livroId, pagina),
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return <div className="h-[120px] rounded-2xl border border-borda bg-superficie" />;
  }

  const resenhas = data?.content ?? [];

  if (resenhas.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-borda-forte px-5 py-8 text-center text-[14px] text-suave">
        Ainda não há resenhas deste livro.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3.5">
        {resenhas.map((resenha) => (
          <li key={resenha.id} className="rounded-2xl border border-borda bg-superficie p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracota text-[13px] font-semibold text-white">
                {iniciais(resenha.readerName)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-tinta">
                    {resenha.readerName}
                  </span>
                  {resenha.mine && (
                    <span className="rounded-full bg-creme px-1.5 py-0.5 text-[10.5px] font-semibold text-suave">
                      você
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <EstrelasNota nota={resenha.rating} tamanho={12} />
                  <span className="text-[12px] text-suave-2">
                    {new Date(resenha.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            <TextoComSpoiler
              texto={resenha.review ?? ""}
              spoiler={resenha.spoiler}
              className="text-[14.5px] leading-relaxed text-tinta-2"
            />
          </li>
        ))}
      </ul>

      <Paginacao
        pagina={pagina}
        totalPaginas={data?.totalPages ?? 1}
        aoAnterior={() => setPagina((p) => Math.max(0, p - 1))}
        aoProxima={() => setPagina((p) => p + 1)}
      />
    </>
  );
}
