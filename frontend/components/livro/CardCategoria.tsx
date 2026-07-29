"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { corLombada } from "@/lib/spines";
import type { Categoria } from "@/lib/tipos";

// Porta de Entrada para uma Categoria do Acervo
export default function CardCategoria({ categoria }: { categoria: Categoria }) {
  const cor = corLombada(categoria.slug);

  return (
    <Link
      href={`/books?categoria=${categoria.slug}`}
      className="group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-2xl border border-borda bg-superficie p-4 transition hover:-translate-y-0.5 hover:border-borda-forte hover:shadow-[0_14px_30px_-18px_rgba(60,45,20,0.4)]"
    >
      {/* Lombada Colorida Deterministica pelo Slug */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[5px] transition-[width] duration-300 group-hover:w-[7px]"
        style={{ backgroundColor: cor }}
      />
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.07] transition group-hover:opacity-[0.13]"
        style={{ backgroundColor: cor }}
      />

      <span className="relative flex items-start justify-between gap-2">
        <span className="line-clamp-2 pl-1.5 text-[14.5px] font-semibold leading-snug text-tinta">
          {categoria.name}
        </span>
        <ArrowUpRight
          size={15}
          className="mt-0.5 shrink-0 text-suave-2 opacity-0 transition group-hover:opacity-100"
        />
      </span>

      <span className="relative pl-1.5 text-[12.5px] text-suave">
        <span className="font-titulo text-[16px] font-bold tabular-nums text-tinta-2">
          {(categoria.bookCount ?? 0).toLocaleString("pt-BR")}
        </span>{" "}
        {categoria.bookCount === 1 ? "livro" : "livros"}
      </span>
    </Link>
  );
}
