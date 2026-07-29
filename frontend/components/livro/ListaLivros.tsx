"use client";

import { useRouter } from "next/navigation";
import type { LivroResumo } from "@/lib/tipos";
import CapaLivro from "./CapaLivro";
import EstrelasNota from "@/components/ui/EstrelasNota";
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
              <td className="px-5 py-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="w-[38px] shrink-0">
                    <CapaLivro
                      id={livro.id}
                      titulo={livro.title}
                      urlCapa={livro.coverUrl}
                      arredondamento="rounded-[5px]"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate font-serif text-[16px] font-medium">
                      {livro.title}
                    </span>
                    <span className="truncate text-[12.5px] text-suave-2 sm:hidden">
                      {livro.author}
                    </span>
                  </div>
                </div>
              </td>

              <td className="hidden px-5 py-3 text-[14px] text-tinta-2 sm:table-cell">
                <span className="line-clamp-1">{livro.author}</span>
              </td>

              <td className="hidden px-5 py-3 text-[14px] tabular-nums text-tinta-2 sm:table-cell">
                {livro.year ?? "—"}
              </td>

              <td className="hidden w-[180px] px-5 py-3 lg:table-cell">
                <Avaliacao nota={livro.averageRating} total={livro.ratingsCount} />
              </td>

              <td className="px-5 py-3">
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

// Nota Média Vinda do Google Books
function Avaliacao({ nota, total }: { nota?: number | null; total?: number | null }) {
  if (!nota) {
    return <span className="text-[13px] text-suave-2">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <EstrelasNota nota={Math.round(nota)} tamanho={13} />
      <span className="text-[12px] text-suave-2">
        {nota.toFixed(1)}
        {total ? ` (${total})` : ""}
      </span>
    </div>
  );
}
