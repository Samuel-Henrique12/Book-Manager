"use client";

import { useSyncExternalStore } from "react";
import { BookOpen, Library, Star } from "lucide-react";
import { obterNome } from "@/lib/auth";
import { CHAVE_NEUTRA, chaveAtual, interpretar } from "@/lib/saudacao";

const semAssinatura = () => () => {};

// Saudação e Números do Acervo
export default function ResumoLeitura({
  total,
  categorias,
  avaliados,
  carregando = false,
}: {
  total: number;
  categorias: number;
  avaliados: number;
  carregando?: boolean;
}) {
  const nome = useSyncExternalStore(semAssinatura, obterNome, () => "Leitor");
  const chave = useSyncExternalStore(semAssinatura, chaveAtual, () => CHAVE_NEUTRA);

  const primeiroNome = nome.split(/\s+/)[0];
  const { saudacao, frase } = interpretar(chave);

  return (
    <section className="mb-10" style={{ animation: "rise 0.4s ease-out both" }}>
      <p className="mb-1.5 text-[14px] font-medium text-terracota">{frase}</p>
      <h1 className="font-titulo text-[32px] font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">
        {saudacao}, {primeiroNome}
      </h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Metrica Icone={Library} valor={total} rotulo="no acervo" carregando={carregando} />
        <Metrica Icone={BookOpen} valor={categorias} rotulo="categorias" carregando={carregando} />
        <Metrica Icone={Star} valor={avaliados} rotulo="bem avaliados" carregando={carregando} />
      </div>
    </section>
  );
}

function Metrica({
  Icone,
  valor,
  rotulo,
  carregando,
}: {
  Icone: typeof BookOpen;
  valor: number;
  rotulo: string;
  carregando: boolean;
}) {
  return (
    <div className="flex min-w-[148px] flex-1 items-center gap-3 rounded-2xl border border-borda bg-superficie px-4 py-3.5 sm:flex-none">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracota-lavagem text-terracota">
        <Icone size={19} strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block font-titulo text-[23px] font-bold leading-none tabular-nums tracking-[-0.02em]">
          {carregando ? "—" : valor.toLocaleString("pt-BR")}
        </span>
        <span className="mt-1 block text-[13px] text-suave">{rotulo}</span>
      </span>
    </div>
  );
}
