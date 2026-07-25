"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { LivroResumo } from "@/lib/tipos";
import { corLombada } from "@/lib/spines";

// Props do Component LivroTabela
interface Props {
  livros: LivroResumo[];
  sortCampo: string;
  sortDir: "asc" | "desc";
  aoOrdenar: (campo: string) => void;
  aoEditar: (id: number) => void;
  aoExcluir: (livro: LivroResumo) => void;
}

const COLUNAS = "grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.5fr)_92px_92px] gap-4";

// Component LivroTabela
export default function LivroTabela({
  livros,
  sortCampo,
  sortDir,
  aoOrdenar,
  aoEditar,
  aoExcluir,
}: Props) {
  const indicador = (campo: string) => (sortCampo === campo ? (sortDir === "asc" ? "↑" : "↓") : "");

  return (
    <div className="overflow-hidden rounded-[14px] border border-borda bg-superficie">
      <div className={`${COLUNAS} border-b border-borda bg-superficie-2 px-[22px] py-3.5`}>
        {[
          { campo: "titulo", rotulo: "Título" },
          { campo: "autor", rotulo: "Autor" },
          { campo: "ano", rotulo: "Ano" },
        ].map((c) => (
          <button
            key={c.campo}
            onClick={() => aoOrdenar(c.campo)}
            className="flex items-center gap-1.5 text-left text-[12px] font-bold uppercase tracking-[0.06em] text-suave"
          >
            {c.rotulo} <span className="text-terracota">{indicador(c.campo)}</span>
          </button>
        ))}
        <span className="text-right text-[12px] font-bold uppercase tracking-[0.06em] text-suave">
          Ações
        </span>
      </div>

      {livros.map((livro) => (
        <div
          key={livro.id}
          className={`${COLUNAS} items-center border-b border-[#f0e9da] px-[22px] py-4 transition last:border-b-0 hover:bg-[#f7f1e4]`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="h-[34px] w-2 flex-shrink-0 rounded"
              style={{ background: corLombada(livro.id) }}
            />
            <div className="min-w-0">
              <div className="truncate font-serif text-[17px] font-medium">{livro.titulo}</div>
              <div className="truncate text-[12.5px] text-suave-2">{livro.descricao || "—"}</div>
            </div>
          </div>
          <div className="truncate text-[14.5px] text-[#5c554b]">{livro.autor}</div>
          <div className="text-[14px] text-[#5c554b]">{livro.ano ?? "—"}</div>
          <div className="flex justify-end gap-1.5">
            <BotaoAcao tipo="editar" onClick={() => aoEditar(livro.id)} />
            <BotaoAcao tipo="excluir" onClick={() => aoExcluir(livro)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BotaoAcao({ tipo, onClick }: { tipo: "editar" | "excluir"; onClick: () => void }) {
  const editar = tipo === "editar";
  return (
    <button
      onClick={onClick}
      title={editar ? "Editar" : "Excluir"}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-borda-forte bg-superficie-2 text-[#5c554b] transition ${
        editar ? "hover:bg-white hover:text-terracota" : "hover:border-[#e6c6ba] hover:bg-[#fbeee9] hover:text-erro"
      }`}
    >
      {editar ? <Pencil size={15} strokeWidth={1.9} /> : <Trash2 size={15} strokeWidth={1.9} />}
    </button>
  );
}
