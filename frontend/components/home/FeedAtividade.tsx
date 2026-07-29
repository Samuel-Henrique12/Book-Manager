"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, PenLine } from "lucide-react";
import { listarAtividade } from "@/lib/atividade";
import { iniciais } from "@/lib/spines";
import type { Atividade } from "@/lib/tipos";
import EstrelasNota from "@/components/ui/EstrelasNota";
import TextoComSpoiler from "@/components/ui/TextoComSpoiler";

// O que a Comunidade Anda Publicando
export default function FeedAtividade({ quantidade = 6 }: { quantidade?: number }) {
  const { data: eventos = [], isPending } = useQuery({
    queryKey: ["atividade", quantidade],
    queryFn: () => listarAtividade(quantidade),
    staleTime: 60 * 1000,
  });

  if (isPending) {
    return (
      <div
        className="h-[260px] rounded-2xl border border-borda bg-superficie"
        style={{ animation: "sk 1.3s ease-in-out infinite" }}
      />
    );
  }

  if (eventos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-borda-forte px-5 py-8 text-center text-[14px] text-suave">
        Ninguém publicou nada ainda. Avalie um livro para começar.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {eventos.map((evento, indice) => (
        <ItemAtividade key={`${evento.type}-${evento.bookId}-${indice}`} evento={evento} />
      ))}
    </ul>
  );
}

function ItemAtividade({ evento }: { evento: Atividade }) {
  const resenha = evento.type === "REVIEW";

  return (
    <li className="rounded-2xl border border-borda bg-superficie p-4 transition hover:border-borda-forte">
      <div className="mb-2.5 flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-[12px] font-semibold text-tinta-2">
          {iniciais(evento.readerName)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] leading-snug text-tinta-2">
            <span className="font-semibold text-tinta">{evento.readerName}</span>{" "}
            {resenha ? "avaliou" : "comentou em"}{" "}
            <Link
              href={`/books/${evento.bookId}`}
              className="font-serif font-medium text-terracota transition hover:text-terracota-escuro"
            >
              {evento.bookTitle}
            </Link>
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11.5px] text-suave-2">
              {resenha ? <PenLine size={11} /> : <MessageSquare size={11} />}
              {new Date(evento.createdAt).toLocaleDateString("pt-BR")}
            </span>
            {resenha && evento.rating != null && (
              <EstrelasNota nota={evento.rating} tamanho={11} />
            )}
          </div>
        </div>
      </div>

      <TextoComSpoiler
        texto={evento.text}
        spoiler={evento.spoiler}
        className="line-clamp-3 text-[14px] leading-relaxed text-tinta-2"
      />
    </li>
  );
}
