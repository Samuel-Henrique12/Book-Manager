"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, Check, Heart, Loader2, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import { obterVaga, removerVaga, salvarVaga } from "@/lib/estante";
import { FITA_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
import type { StatusLeitura } from "@/lib/tipos";

const STATUS: StatusLeitura[] = ["QUERO_LER", "LENDO", "LIDO", "ABANDONADO"];
const PASSO_RAPIDO = 10;

// Painel Principal de Ação: Estante, Favorito e Progresso
export default function BotaoEstante({
  livroId,
  totalDoLivro,
}: {
  livroId: number;
  totalDoLivro?: number | null;
}) {
  const queryClient = useQueryClient();
  const alerta = useAlerta();

  const { data: vaga, isPending } = useQuery({
    queryKey: ["estante", livroId],
    queryFn: () => obterVaga(livroId),
  });

  const [pagina, setPagina] = useState("");
  const [total, setTotal] = useState("");

  useEffect(() => {
    setPagina(vaga?.currentPage != null ? String(vaga.currentPage) : "");
    setTotal(vaga?.totalPages != null ? String(vaga.totalPages) : "");
  }, [vaga]);

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["estante"] });
    queryClient.invalidateQueries({ queryKey: ["livros"] });
  }

  const salvar = useMutation({
    mutationFn: (dados: {
      status: StatusLeitura;
      favorite: boolean;
      currentPage?: number | null;
      totalPages?: number | null;
    }) => salvarVaga(livroId, dados),
    onSuccess: recarregar,
    onError: (erro) =>
      alerta.erro(erro instanceof ApiError ? erro.message : "Não foi possível salvar na estante"),
  });

  const remover = useMutation({
    mutationFn: () => removerVaga(livroId),
    onSuccess: () => {
      recarregar();
      alerta.sucesso("Livro retirado da estante");
    },
    onError: () => alerta.erro("Não foi possível retirar o livro"),
  });

  if (isPending) {
    return (
      <div
        className="h-[132px] rounded-2xl border border-borda bg-superficie"
        style={{ animation: "sk 1.3s ease-in-out infinite" }}
      />
    );
  }

  const favorito = vaga?.favorite ?? false;
  const totalConhecido = totalDoLivro ?? vaga?.totalPages ?? null;
  const paginaAtual = vaga?.currentPage ?? 0;
  const percentual =
    totalConhecido && totalConhecido > 0
      ? Math.min(100, Math.round((paginaAtual / totalConhecido) * 100))
      : null;

  // Trocar de Status Não Precisa Perder a Pagina Registrada
  function enviar(status: StatusLeitura, campos: { pagina?: number | null } = {}) {
    const paginaEnviada =
      campos.pagina !== undefined
        ? campos.pagina
        : status === "LENDO"
          ? Number(pagina) || null
          : null;

    salvar.mutate({
      status,
      favorite: favorito,
      currentPage: paginaEnviada,
      totalPages: totalDoLivro ? null : Number(total) || null,
    });
  }

  function avancar(paginas: number) {
    const alvo = Math.max(0, Number(pagina || 0) + paginas);
    const limitado = totalConhecido ? Math.min(alvo, totalConhecido) : alvo;
    setPagina(String(limitado));
    enviar("LENDO", { pagina: limitado });
  }

  return (
    <section className="rounded-2xl border border-borda bg-superficie p-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-titulo text-[17px] font-bold tracking-[-0.02em]">
          {vaga ? "Na sua estante" : "Adicionar à estante"}
        </h2>

        <button
          type="button"
          onClick={() =>
            salvar.mutate({
              status: vaga?.status ?? "QUERO_LER",
              favorite: !favorito,
              currentPage: vaga?.currentPage ?? null,
              totalPages: totalDoLivro ? null : Number(total) || null,
            })
          }
          aria-pressed={favorito}
          className={`flex h-[34px] items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition ${
            favorito
              ? "border-terracota/35 bg-terracota-lavagem text-terracota-escuro"
              : "border-borda-forte text-tinta-2 hover:bg-creme"
          }`}
        >
          <Heart size={14} className={favorito ? "fill-terracota text-terracota" : ""} />
          {favorito ? "Favorito" : "Favoritar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS.map((status) => {
          const ativo = vaga?.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => enviar(status)}
              disabled={salvar.isPending}
              aria-pressed={ativo}
              className={`flex h-[44px] items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-semibold transition disabled:opacity-70 ${
                ativo
                  ? `${FITA_STATUS[status]} text-white shadow-[0_6px_16px_-8px_rgba(60,45,20,0.6)]`
                  : "border border-borda-forte text-tinta-2 hover:bg-creme"
              }`}
            >
              {ativo && <Check size={14} strokeWidth={2.4} />}
              {!vaga && status === "QUERO_LER" && <BookmarkPlus size={14} strokeWidth={2} />}
              {ROTULO_STATUS[status]}
            </button>
          );
        })}
      </div>

      {/* Progresso: Só Durante a Leitura */}
      {vaga?.status === "LENDO" && (
        <div className="mt-5 rounded-xl border border-borda bg-superficie-2 p-4">
          <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
            <span className="text-[13px] font-semibold text-tinta-2">Progresso de leitura</span>
            {percentual != null && (
              <span className="font-titulo text-[19px] font-bold leading-none tabular-nums text-terracota">
                {percentual}%
              </span>
            )}
          </div>

          {totalConhecido ? (
            <div
              role="progressbar"
              aria-valuenow={percentual ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso de leitura: ${percentual ?? 0}%`}
              className="mb-3.5 h-2.5 overflow-hidden rounded-full bg-creme"
            >
              <div
                className="h-full rounded-full bg-terracota transition-[width] duration-500"
                style={{ width: `${percentual ?? 0}%` }}
              />
            </div>
          ) : (
            <label className="mb-3 block text-[12.5px] text-suave">
              Quantas páginas tem o livro?
              <input
                value={total}
                onChange={(evento) => setTotal(evento.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={5}
                placeholder="Ex.: 320"
                className="mt-1 h-[38px] w-full rounded-lg border border-borda bg-superficie px-3 text-[14px] text-tinta outline-none focus:border-terracota"
              />
            </label>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[110px] flex-1 text-[12.5px] text-suave">
              Página atual
              <input
                value={pagina}
                onChange={(evento) => setPagina(evento.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={5}
                placeholder="0"
                className="mt-1 h-[38px] w-full rounded-lg border border-borda bg-superficie px-3 text-[14px] tabular-nums text-tinta outline-none focus:border-terracota"
              />
            </label>

            <button
              type="button"
              onClick={() => enviar("LENDO")}
              disabled={salvar.isPending}
              className="flex h-[38px] items-center gap-1.5 rounded-lg bg-terracota px-4 text-[13.5px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
            >
              {salvar.isPending && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>

            <button
              type="button"
              onClick={() => avancar(PASSO_RAPIDO)}
              disabled={salvar.isPending}
              title={`Avançar ${PASSO_RAPIDO} páginas`}
              className="h-[38px] rounded-lg border border-borda-forte px-3 text-[13px] font-semibold text-tinta-2 transition hover:bg-creme disabled:opacity-70"
            >
              +{PASSO_RAPIDO}
            </button>

            {totalConhecido && (
              <button
                type="button"
                onClick={() => enviar("LIDO", { pagina: null })}
                disabled={salvar.isPending}
                className="h-[38px] rounded-lg border border-verde/40 px-3 text-[13px] font-semibold text-verde transition hover:bg-verde/10 disabled:opacity-70"
              >
                Terminei
              </button>
            )}
          </div>

          {totalConhecido && (
            <p className="mt-2.5 text-[12px] tabular-nums text-suave-2">
              página {paginaAtual.toLocaleString("pt-BR")} de{" "}
              {totalConhecido.toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      )}

      {vaga && (
        <button
          type="button"
          onClick={() => remover.mutate()}
          disabled={remover.isPending}
          className="mt-3.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-suave transition hover:text-erro disabled:opacity-60"
        >
          <Trash2 size={13} strokeWidth={1.9} />
          Tirar da estante
        </button>
      )}
    </section>
  );
}
