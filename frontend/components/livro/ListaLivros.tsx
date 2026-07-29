"use client";

import { useRouter } from "next/navigation";
import type { LivroResumo } from "@/lib/tipos";
import { Heart } from "lucide-react";
import { FITA_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
import CapaLivro from "./CapaLivro";
import NotasDoLivro from "./NotasDoLivro";
import BotaoAcao from "@/components/ui/BotaoAcao";

const COLUNAS = [
  { campo: "title", rotulo: "Título" },
  { campo: "author", rotulo: "Autor" },
  { campo: "year", rotulo: "Ano" },
] as const;

// Lista Compacta de Livros
export default function ListaLivros({
  livros,
  podeGerenciar = false,
  sortCampo,
  sortDir,
  aoOrdenar,
  aoEditar,
  aoExcluir,
}: {
  livros: LivroResumo[];
  podeGerenciar?: boolean;
  sortCampo: string;
  sortDir: "asc" | "desc";
  aoOrdenar: (campo: string) => void;
  aoEditar: (id: number) => void;
  aoExcluir: (livro: LivroResumo) => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[14px] border border-borda bg-superficie">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-borda bg-superficie-2">
            {COLUNAS.map((coluna) => {
              const ativo = sortCampo === coluna.campo;
              return (
                <th
                  key={coluna.campo}
                  scope="col"
                  aria-sort={ativo ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className={`px-5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-suave ${
                    coluna.campo === "title" ? "" : "hidden sm:table-cell"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => aoOrdenar(coluna.campo)}
                    className="flex items-center gap-1.5 transition hover:text-tinta-2"
                  >
                    {coluna.rotulo}
                    <span className="text-terracota">
                      {ativo ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </th>
              );
            })}
            <th
              scope="col"
              className="hidden px-5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-suave lg:table-cell"
            >
              Avaliação
            </th>
            <th scope="col" className="px-5 py-3 text-right">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {livros.map((livro) => (
            <tr
              key={livro.id}
              onClick={() => router.push(`/books/${livro.id}`)}
              className="cursor-pointer border-b border-borda transition last:border-b-0 hover:bg-superficie-2"
            >
              {/* max-w-0 e o que Faz o truncate Valer Dentro de Tabela */}
              <td className="w-full max-w-0 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative w-[38px] shrink-0">
                    <CapaLivro
                      id={livro.id}
                      titulo={livro.title}
                      urlCapa={livro.coverUrl}
                      arredondamento="rounded-[5px]"
                    />
                    {livro.favorite && (
                      <span
                        role="img"
                        aria-label="Favorito"
                        className="absolute -bottom-1 -right-1 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-superficie shadow-[0_1px_4px_rgba(60,45,20,0.3)]"
                      >
                        <Heart size={9} className="fill-terracota text-terracota" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-serif text-[16px] font-medium">
                        {livro.title}
                      </span>
                      {livro.shelfStatus && (
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.04em] text-white ${FITA_STATUS[livro.shelfStatus]}`}
                        >
                          {ROTULO_STATUS[livro.shelfStatus]}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12.5px] text-suave-2 sm:hidden">
                      {livro.author}
                    </span>
                  </div>
                </div>
              </td>

              <td className="hidden max-w-0 px-5 py-3 text-[14px] text-tinta-2 sm:table-cell sm:w-[24%]">
                <span className="block truncate">{livro.author}</span>
              </td>

              <td className="hidden w-[80px] whitespace-nowrap px-5 py-3 text-[14px] tabular-nums text-tinta-2 sm:table-cell">
                {livro.year ?? "—"}
              </td>

              <td className="hidden w-[190px] px-5 py-3 lg:table-cell">
                <NotasDoLivro livro={livro} compacto />
              </td>

              <td className="w-[96px] whitespace-nowrap px-5 py-3">
                {podeGerenciar && (
                  <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <BotaoAcao tipo="editar" onClick={() => aoEditar(livro.id)} />
                    <BotaoAcao tipo="excluir" onClick={() => aoExcluir(livro)} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
