"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { EstanteItem, LivroResumo } from "@/lib/tipos";
import { CLASSE_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
import CapaLivro from "./CapaLivro";
import EstrelasNota from "@/components/ui/EstrelasNota";
import BarraProgresso from "@/components/ui/BarraProgresso";
import BotaoAcao from "@/components/ui/BotaoAcao";

// Cartão de Livro da Grade
export default function CartaoLivro({
  livro,
  estante,
  aoEditar,
  aoExcluir,
  aoFavoritar,
}: {
  livro: LivroResumo;
  estante: EstanteItem;
  aoEditar: (id: number) => void;
  aoExcluir: (livro: LivroResumo) => void;
  // TODO: — PATCH /estante/livros/{id}/favorito
  aoFavoritar?: (id: number) => void;
}) {
  const lendo = estante.status === "LENDO" && estante.paginaAtual && estante.totalPaginas;

  return (
    <article className="group relative">
      <Link
        href={`/books/${livro.id}/edit`}
        aria-label={`Abrir ${livro.titulo}`}
        className="block rounded-[10px] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracota group-hover:-translate-y-1"
      >
        <CapaLivro
          id={livro.id}
          titulo={livro.titulo}
          autor={livro.autor}
          urlCapa={livro.urlCapa}
        />
      </Link>

      {/* Marcador de Favorito */}
      {(estante.favorito || aoFavoritar) && (
        <FavoritoSobreposto
          marcado={estante.favorito}
          aoFavoritar={aoFavoritar ? () => aoFavoritar(livro.id) : undefined}
        />
      )}

      {/* Ações ao Passar o Mouse */}
      <div className="pointer-events-none absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
        <BotaoAcao tipo="editar" tamanho={30} onClick={() => aoEditar(livro.id)} />
        <BotaoAcao tipo="excluir" tamanho={30} onClick={() => aoExcluir(livro)} />
      </div>

      <div className="mt-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLASSE_STATUS[estante.status]}`}
        >
          {ROTULO_STATUS[estante.status]}
        </span>

        <h3 className="mt-1.5 line-clamp-2 font-serif text-[16px] font-medium leading-snug text-pretty">
          {livro.titulo}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-suave">{livro.autor}</p>

        <div className="mt-2 min-h-[18px]">
          {lendo ? (
            <BarraProgresso
              compacta
              paginaAtual={estante.paginaAtual as number}
              totalPaginas={estante.totalPaginas as number}
            />
          ) : estante.nota ? (
            <EstrelasNota nota={estante.nota} tamanho={13} />
          ) : (
            <span className="text-[12px] text-suave-2">{livro.ano ?? "—"}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function FavoritoSobreposto({
  marcado,
  aoFavoritar,
}: {
  marcado: boolean;
  aoFavoritar?: () => void;
}) {
  const icone = (
    <Heart
      size={14}
      strokeWidth={2}
      className={marcado ? "fill-terracota text-terracota" : "text-suave"}
    />
  );
  const base =
    "absolute left-2 top-2 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-superficie/92 shadow-[0_2px_8px_rgba(60,45,20,0.28)] backdrop-blur-[2px]";

  if (!aoFavoritar) {
    return (
      <span className={base} role="img" aria-label="Favorito">
        {icone}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={aoFavoritar}
      aria-pressed={marcado}
      aria-label={marcado ? "Remover dos favoritos" : "Favoritar"}
      className={`${base} transition hover:scale-110`}
    >
      {icone}
    </button>
  );
}
