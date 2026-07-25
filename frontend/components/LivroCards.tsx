"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { LivroResumo } from "@/lib/tipos";
import { corLombada } from "@/lib/spines";

// Props do Component LivroCards
interface Props {
  livros: LivroResumo[];
  aoEditar: (id: number) => void;
  aoExcluir: (livro: LivroResumo) => void;
}

// Component LivroCards
export default function LivroCards({ livros, aoEditar, aoExcluir }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {livros.map((livro) => (
        <div
          key={livro.id}
          className="relative overflow-hidden rounded-[14px] border border-borda bg-superficie p-5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(60,45,20,0.35)]"
        >
          <div
            className="absolute inset-y-0 left-0 w-[5px]"
            style={{ background: corLombada(livro.id) }}
          />
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="rounded-full bg-superficie-2 px-2.5 py-1 text-[12px] font-semibold text-suave-2">
              {livro.ano ?? "—"}
            </span>
            <div className="flex gap-1.5">
              <BotaoAcao tipo="editar" onClick={() => aoEditar(livro.id)} />
              <BotaoAcao tipo="excluir" onClick={() => aoExcluir(livro)} />
            </div>
          </div>
          <h3 className="mb-1 font-serif text-[20px] font-medium leading-tight text-pretty">
            {livro.titulo}
          </h3>
          <p className="mb-3 text-[14px] text-suave">{livro.autor}</p>
          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-suave-2">
            {livro.descricao || "Sem descrição."}
          </p>
        </div>
      ))}
    </div>
  );
}

// Component BotaoAcao
function BotaoAcao({ tipo, onClick }: { tipo: "editar" | "excluir"; onClick: () => void }) {
  const editar = tipo === "editar";
  return (
    <button
      onClick={onClick}
      title={editar ? "Editar" : "Excluir"}
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-borda-forte bg-superficie-2 text-tinta-2 transition ${
        editar
          ? "hover:bg-superficie hover:text-terracota"
          : "hover:border-erro/40 hover:bg-erro-lavagem hover:text-erro"
      }`}
    >
      {editar ? <Pencil size={14} strokeWidth={1.9} /> : <Trash2 size={14} strokeWidth={1.9} />}
    </button>
  );
}
