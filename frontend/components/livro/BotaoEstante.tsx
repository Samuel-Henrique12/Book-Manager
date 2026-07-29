"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, Heart, Loader2, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import { obterVaga, removerVaga, salvarVaga } from "@/lib/estante";
import { FITA_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
import type { StatusLeitura } from "@/lib/tipos";
import BarraProgresso from "@/components/ui/BarraProgresso";

const STATUS: StatusLeitura[] = ["QUERO_LER", "LENDO", "LIDO", "ABANDONADO"];

// Adiciona o Livro a Estante e Acompanha a Leitura
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
    return <div className="mt-5 h-[46px] rounded-xl border border-borda bg-superficie" />;
  }

  const favorito = vaga?.favorite ?? false;
  const totalConhecido = totalDoLivro ?? vaga?.totalPages ?? null;

  function trocarStatus(status: StatusLeitura) {
    salvar.mutate({
      status,
      favorite: favorito,
      currentPage: status === "LENDO" && pagina ? Number(pagina) : null,
      totalPages: totalDoLivro ? null : total ? Number(total) : null,
    });
  }

  return (
    <div className="mt-5 border-t border-borda pt-5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.09em] text-suave-2">
          MINHA ESTANTE
        </span>
        {vaga && (
          <button
            type="button"
            onClick={() => salvar.mutate({ status: vaga.status, favorite: !favorito })}
            aria-pressed={favorito}
            aria-label={favorito ? "Remover dos favoritos" : "Favoritar"}
            title={favorito ? "Remover dos favoritos" : "Favoritar"}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-superficie-2"
          >
            <Heart
              size={16}
              className={favorito ? "fill-terracota text-terracota" : "text-suave-2"}
            />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {STATUS.map((status) => {
          const ativo = vaga?.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => trocarStatus(status)}
              disabled={salvar.isPending}
              aria-pressed={ativo}
              className={`flex h-[34px] items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition disabled:opacity-70 ${
                ativo
                  ? `${FITA_STATUS[status]} text-white`
                  : "border border-borda-forte text-tinta-2 hover:bg-creme"
              }`}
            >
              {!vaga && status === "QUERO_LER" && <BookmarkPlus size={13} strokeWidth={2} />}
              {ROTULO_STATUS[status]}
            </button>
          );
        })}
      </div>

      {/* Progresso: Apenas Durante a Leitura */}
      {vaga?.status === "LENDO" && (
        <div className="mt-4">
          {!totalDoLivro && (
            <label className="mb-2 block text-[12px] text-suave">
              Total de páginas
              <input
                value={total}
                onChange={(evento) => setTotal(evento.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={5}
                placeholder="Ex.: 320"
                className="mt-1 h-[34px] w-full rounded-lg border border-borda bg-superficie px-3 text-[13px] text-tinta outline-none focus:border-terracota"
              />
            </label>
          )}

          <label className="block text-[12px] text-suave">
            Página atual
            <div className="mt-1 flex gap-2">
              <input
                value={pagina}
                onChange={(evento) => setPagina(evento.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={5}
                placeholder="0"
                className="h-[34px] min-w-0 flex-1 rounded-lg border border-borda bg-superficie px-3 text-[13px] text-tinta outline-none focus:border-terracota"
              />
              <button
                type="button"
                onClick={() => trocarStatus("LENDO")}
                disabled={salvar.isPending}
                className="flex h-[34px] items-center gap-1.5 rounded-lg bg-terracota px-3 text-[12.5px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
              >
                {salvar.isPending && <Loader2 size={13} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </label>

          {vaga.progress != null && totalConhecido && (
            <div className="mt-3">
              <BarraProgresso
                paginaAtual={vaga.currentPage ?? 0}
                totalPaginas={totalConhecido}
              />
            </div>
          )}
        </div>
      )}

      {vaga && (
        <button
          type="button"
          onClick={() => remover.mutate()}
          disabled={remover.isPending}
          className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-suave transition hover:text-erro disabled:opacity-60"
        >
          <Trash2 size={13} strokeWidth={1.9} />
          Tirar da estante
        </button>
      )}
    </div>
  );
}
