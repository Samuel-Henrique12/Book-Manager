"use client";

import Link from "next/link";
import type { EstanteItem, LivroResumo } from "@/lib/tipos";
import CapaLivro from "@/components/livro/CapaLivro";
import BarraProgresso from "@/components/ui/BarraProgresso";

// Livros em Andamento
export default function ContinueLendo({
  itens,
}: {
  itens: { livro: LivroResumo; estante: EstanteItem }[];
}) {
  if (itens.length === 0) return null;

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {itens.map(({ livro, estante }, indice) => (
        <Link
          key={livro.id}
          href={`/books/${livro.id}/edit`}
          style={{ animation: `rise 0.45s ease-out ${indice * 70}ms both` }}
          className="flex gap-4 rounded-2xl border border-borda bg-superficie p-3.5 transition hover:-translate-y-0.5 hover:border-borda-forte hover:shadow-[0_14px_30px_-18px_rgba(60,45,20,0.4)]"
        >
          <div className="w-[62px] shrink-0">
            <CapaLivro
              id={livro.id}
              titulo={livro.titulo}
              urlCapa={livro.urlCapa}
              arredondamento="rounded-lg"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-serif text-[16px] font-medium leading-snug text-pretty">
                {livro.titulo}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-[13px] text-suave">{livro.autor}</p>
            </div>
            <BarraProgresso
              className="mt-3"
              paginaAtual={estante.paginaAtual ?? 0}
              totalPaginas={estante.totalPaginas ?? 0}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
