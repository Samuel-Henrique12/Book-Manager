"use client";

import Link from "next/link";
import type { LivroResumo } from "@/lib/tipos";
import CapaLivro from "./CapaLivro";
import EstrelasNota from "@/components/ui/EstrelasNota";
import BotaoAcao from "@/components/ui/BotaoAcao";

// Cartão de Livro da Grade
export default function CartaoLivro({
  livro,
  podeGerenciar = false,
  aoEditar,
  aoExcluir,
}: {
  livro: LivroResumo;
  podeGerenciar?: boolean;
  aoEditar: (id: number) => void;
  aoExcluir: (livro: LivroResumo) => void;
}) {
  const categoria = livro.categories?.[0];

  return (
    <article className="group relative">
      {/* Sem Tela de Detalhe Ainda: Quem Nao Gerencia So Visualiza a Capa */}
      {podeGerenciar ? (
        <Link
          href={`/books/${livro.id}/edit`}
          aria-label={`Abrir ${livro.title}`}
          className="block rounded-[10px] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracota group-hover:-translate-y-1"
        >
          <CapaLivro
            id={livro.id}
            titulo={livro.title}
            autor={livro.author}
            urlCapa={livro.coverUrl}
          />
        </Link>
      ) : (
        <CapaLivro
          id={livro.id}
          titulo={livro.title}
          autor={livro.author}
          urlCapa={livro.coverUrl}
        />
      )}

      {/* Ações ao Passar o Mouse — Somente Administradores */}
      {podeGerenciar && (
        <div className="pointer-events-none absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          <BotaoAcao tipo="editar" tamanho={30} onClick={() => aoEditar(livro.id)} />
          <BotaoAcao tipo="excluir" tamanho={30} onClick={() => aoExcluir(livro)} />
        </div>
      )}

      <div className="mt-3">
        {categoria && (
          <span className="inline-block rounded-full bg-superficie-2 px-2 py-0.5 text-[11px] font-semibold text-suave">
            {categoria.name}
          </span>
        )}

        <h3 className="mt-1.5 line-clamp-2 font-serif text-[16px] font-medium leading-snug text-pretty">
          {livro.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-suave">{livro.author}</p>

        <div className="mt-2 flex min-h-[18px] items-center gap-2">
          {livro.averageRating ? (
            <>
              <EstrelasNota nota={Math.round(livro.averageRating)} tamanho={13} />
              <span className="text-[11.5px] text-suave-2">
                {livro.averageRating.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-suave-2">{livro.year ?? "—"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
