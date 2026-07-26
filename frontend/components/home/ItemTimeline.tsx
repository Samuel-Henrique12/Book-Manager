"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Heart, Plus, Star, TrendingUp, X } from "lucide-react";
import type { EventoTimeline, TipoEvento } from "@/lib/tipos";
import { ROTULO_EVENTO } from "@/lib/rotulos";
import EstrelasNota from "@/components/ui/EstrelasNota";

const ICONES: Record<TipoEvento, { Icone: typeof BookOpen; classe: string }> = {
  ADICIONOU: { Icone: Plus, classe: "bg-superficie-2 text-suave" },
  INICIOU: { Icone: BookOpen, classe: "bg-terracota-lavagem text-terracota" },
  PROGREDIU: { Icone: TrendingUp, classe: "bg-terracota-lavagem text-terracota" },
  TERMINOU: { Icone: CheckCircle2, classe: "bg-verde/12 text-verde" },
  AVALIOU: { Icone: Star, classe: "bg-verde/12 text-verde" },
  FAVORITOU: { Icone: Heart, classe: "bg-terracota-lavagem text-terracota" },
  ABANDONOU: { Icone: X, classe: "bg-creme text-suave-2" },
};

// Entrada do Feed de Atividade
export default function ItemTimeline({ evento }: { evento: EventoTimeline }) {
  const [revelado, setRevelado] = useState(false);
  const { Icone, classe } = ICONES[evento.tipo];
  const oculto = Boolean(evento.spoiler) && !revelado;

  return (
    <li className="group relative flex gap-3.5 pb-6 last:pb-0">
      {/* Linha do Tempo */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[17px] top-9 w-px bg-borda group-last:hidden"
      />

      <span
        className={`relative z-10 flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full ${classe}`}
      >
        <Icone size={16} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <p className="text-[14.5px] leading-snug text-tinta-2">
          Você {ROTULO_EVENTO[evento.tipo]}{" "}
          <Link
            href={`/books/${evento.livroId}/edit`}
            className="font-semibold text-tinta transition hover:text-terracota"
          >
            {evento.livroTitulo}
          </Link>
          {evento.nota ? (
            <EstrelasNota nota={evento.nota} tamanho={12} className="ml-2 align-[-1px]" />
          ) : null}
        </p>

        <p className="mt-0.5 text-[12.5px] text-suave-2">{evento.quando}</p>

        {evento.comentario && (
          <div className="mt-2.5 rounded-xl border border-borda bg-superficie-2 px-3.5 py-2.5">
            <p
              className={`text-[13.5px] leading-relaxed text-tinta-2 transition ${
                oculto ? "select-none blur-[5px]" : ""
              }`}
              aria-hidden={oculto}
            >
              {evento.comentario}
            </p>

            {oculto && (
              <button
                type="button"
                onClick={() => setRevelado(true)}
                className="mt-2 text-[12.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
              >
                Contém spoiler — mostrar mesmo assim
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
