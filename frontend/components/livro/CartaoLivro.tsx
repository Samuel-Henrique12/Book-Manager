"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { LivroResumo } from "@/lib/tipos";
import { FITA_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
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
      <Link
        href={`/books/${livro.id}`}
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

      {/* Fita de Status Sobre a Capa */}
      {livro.shelfStatus && (
        <span
          title={ROTULO_STATUS[livro.shelfStatus]}
          className={`pointer-events-none absolute left-0 top-3 rounded-r-md py-1 pl-2 pr-2.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_2px_6px_rgba(60,45,20,0.35)] ${FITA_STATUS[livro.shelfStatus]}`}
        >
          {ROTULO_STATUS[livro.shelfStatus]}
        </span>
      )}

      {livro.favorite && (
        <span
          role="img"
          aria-label="Favorito"
          className="pointer-events-none absolute bottom-2 left-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-superficie/92 shadow-[0_2px_8px_rgba(60,45,20,0.28)]"
        >
          <Heart size={13} className="fill-terracota text-terracota" />
        </span>
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
