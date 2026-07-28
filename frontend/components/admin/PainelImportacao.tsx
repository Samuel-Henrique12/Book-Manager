"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudDownload, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import { importarDoGoogleBooks, obterProgressoImportacao } from "@/lib/integracao";

const INTERVALO_POLLING = 2000;

// Importação do Catálogo do Google Books
export default function PainelImportacao() {
  const queryClient = useQueryClient();
  const alerta = useAlerta();

  const { data: progresso } = useQuery({
    queryKey: ["importacao"],
    queryFn: obterProgressoImportacao,
    // Só Consulta em Intervalo Curto Enquanto a Importação Roda
    refetchInterval: (consulta) =>
      consulta.state.data?.emAndamento ? INTERVALO_POLLING : false,
  });

  const importar = useMutation({
    mutationFn: importarDoGoogleBooks,
    onSuccess: (inicio) => {
      queryClient.setQueryData(["importacao"], inicio);
      queryClient.invalidateQueries({ queryKey: ["importacao"] });
    },
    onError: (erro) =>
      alerta.erro(
        erro instanceof ApiError ? erro.message : "Não foi possível iniciar a importação",
      ),
  });

  const rodando = Boolean(progresso?.emAndamento) || importar.isPending;
  const percentual =
    progresso && progresso.totalTemas > 0
      ? Math.round((progresso.temasConcluidos / progresso.totalTemas) * 100)
      : 0;

  return (
    <section className="mb-8 rounded-2xl border border-borda bg-superficie p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-titulo text-[19px] font-bold tracking-[-0.025em]">
            Catálogo do Google Books
          </h2>
          <p className="mt-1 max-w-[560px] text-[14px] leading-relaxed text-suave">
            Importa livros reais por tema para o acervo compartilhado. Títulos já existentes são
            ignorados, então rodar de novo é seguro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => importar.mutate()}
          disabled={rodando}
          className="flex h-[42px] shrink-0 items-center gap-2 rounded-xl bg-terracota px-4 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
        >
          {rodando ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
          {rodando ? "Importando..." : "Importar"}
        </button>
      </div>

      {progresso && (progresso.emAndamento || progresso.mensagem) && (
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            <span className="font-medium text-tinta-2">
              {progresso.emAndamento
                ? `Tema ${progresso.temasConcluidos + 1} de ${progresso.totalTemas}${
                    progresso.temaAtual ? ` — ${progresso.temaAtual}` : ""
                  }`
                : progresso.mensagem}
            </span>
            <span className="tabular-nums text-suave">
              {progresso.importados.toLocaleString("pt-BR")} importados ·{" "}
              {progresso.ignorados.toLocaleString("pt-BR")} já existiam
              {progresso.falhas > 0 && ` · ${progresso.falhas} falhas`}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-creme">
            <div
              className="h-full rounded-full bg-terracota transition-all duration-500"
              style={{ width: `${progresso.emAndamento ? Math.max(percentual, 3) : 100}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
