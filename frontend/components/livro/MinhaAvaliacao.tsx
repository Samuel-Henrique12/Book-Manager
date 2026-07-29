"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import {
  obterMinhaAvaliacao,
  removerMinhaAvaliacao,
  salvarMinhaAvaliacao,
} from "@/lib/avaliacoes";
import EstrelasNota from "@/components/ui/EstrelasNota";
import { CampoTexto } from "@/components/CampoFormulario";

const LIMITE_RESENHA = 5000;

// Nota e Resenha do Proprio Leitor
export default function MinhaAvaliacao({ livroId }: { livroId: number }) {
  const queryClient = useQueryClient();
  const alerta = useAlerta();

  const { data: minha, isPending } = useQuery({
    queryKey: ["avaliacao", livroId, "minha"],
    queryFn: () => obterMinhaAvaliacao(livroId),
  });

  const [nota, setNota] = useState(0);
  const [resenha, setResenha] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  // Espelha a Avaliacao Ja Existente Assim que Ela Chega
  useEffect(() => {
    setNota(minha?.rating ?? 0);
    setResenha(minha?.review ?? "");
    setSpoiler(minha?.spoiler ?? false);
  }, [minha]);

  function atualizarListas() {
    queryClient.invalidateQueries({ queryKey: ["avaliacao", livroId] });
    queryClient.invalidateQueries({ queryKey: ["resenhas", livroId] });
  }

  const salvar = useMutation({
    mutationFn: () =>
      salvarMinhaAvaliacao(livroId, { rating: nota, review: resenha.trim() || null, spoiler }),
    onSuccess: () => {
      atualizarListas();
      alerta.sucesso(minha ? "Avaliação atualizada" : "Avaliação publicada");
    },
    onError: (erro) =>
      alerta.erro(erro instanceof ApiError ? erro.message : "Não foi possível salvar sua avaliação"),
  });

  const remover = useMutation({
    mutationFn: () => removerMinhaAvaliacao(livroId),
    onSuccess: () => {
      setNota(0);
      setResenha("");
      setSpoiler(false);
      atualizarListas();
      alerta.sucesso("Avaliação removida");
    },
    onError: () => alerta.erro("Não foi possível remover sua avaliação"),
  });

  if (isPending) {
    return <div className="h-[184px] rounded-2xl border border-borda bg-superficie" />;
  }

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-tinta-2">Sua nota</span>
          <EstrelasNota nota={nota || null} tamanho={24} aoAvaliar={setNota} />
        </div>

        {minha && (
          <button
            type="button"
            onClick={() => remover.mutate()}
            disabled={remover.isPending}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-suave transition hover:text-erro disabled:opacity-60"
          >
            <Trash2 size={14} strokeWidth={1.9} />
            Remover
          </button>
        )}
      </div>

      {nota > 0 && (
        <>
          <CampoTexto
            rotulo="Sua resenha"
            rotuloVisivel
            dica="(opcional)"
            className="mt-5"
            rows={4}
            maxLength={LIMITE_RESENHA}
            placeholder="O que você achou da leitura?"
            value={resenha}
            onChange={(evento) => setResenha(evento.target.value)}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-tinta-2">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(evento) => setSpoiler(evento.target.checked)}
                className="h-4 w-4 accent-terracota"
              />
              Minha resenha contém spoiler
            </label>

            <button
              type="button"
              onClick={() => salvar.mutate()}
              disabled={salvar.isPending}
              className="flex items-center gap-2 rounded-xl bg-terracota px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
            >
              {salvar.isPending && <Loader2 size={15} className="animate-spin" />}
              {minha ? "Atualizar avaliação" : "Publicar avaliação"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
