"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Loader2, Send, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import { useConta } from "@/lib/conta";
import { listarComentarios, marcarSpoiler, publicarComentario, removerComentario } from "@/lib/avaliacoes";
import { iniciais } from "@/lib/spines";
import type { Comentario } from "@/lib/tipos";
import TextoComSpoiler from "@/components/ui/TextoComSpoiler";
import Paginacao from "@/components/Paginacao";

const LIMITE = 2000;

// Conversa Livre dos Leitores Sobre o Livro
export default function ConversaLivro({ livroId }: { livroId: number }) {
  const queryClient = useQueryClient();
  const alerta = useAlerta();
  const { data: conta } = useConta();
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(0);

  const podeModerar = Boolean(conta?.podeAdministrar);

  const { data, isPending } = useQuery({
    queryKey: ["comentarios", livroId, pagina],
    queryFn: () => listarComentarios(livroId, pagina),
    placeholderData: keepPreviousData,
  });

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["comentarios", livroId] });
  }

  const publicar = useMutation({
    mutationFn: () => publicarComentario(livroId, texto.trim()),
    onSuccess: () => {
      setTexto("");
      setPagina(0);
      recarregar();
    },
    onError: (erro) =>
      alerta.erro(erro instanceof ApiError ? erro.message : "Não foi possível enviar o comentário"),
  });

  const remover = useMutation({
    mutationFn: (id: number) => removerComentario(livroId, id),
    onSuccess: recarregar,
    onError: () => alerta.erro("Não foi possível remover o comentário"),
  });

  const alternarSpoiler = useMutation({
    mutationFn: ({ id, spoiler }: { id: number; spoiler: boolean }) =>
      marcarSpoiler(livroId, id, spoiler),
    onSuccess: recarregar,
    onError: () => alerta.erro("Não foi possível alterar a marcação"),
  });

  const comentarios = data?.content ?? [];

  return (
    <>
      <div className="mb-5 rounded-2xl border border-borda bg-superficie p-4">
        <textarea
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          rows={3}
          maxLength={LIMITE}
          placeholder="Escreva o que você achou, tire dúvidas, comente com outros leitores..."
          aria-label="Novo comentário"
          className="w-full resize-y rounded-xl border border-borda bg-superficie px-4 py-3 text-[15px] leading-relaxed text-tinta outline-none transition hover:border-borda-forte focus:border-terracota focus:shadow-[0_0_0_3px_var(--color-terracota-lavagem)]"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[12px] text-suave-2">
            {texto.length}/{LIMITE}
          </span>
          <button
            type="button"
            onClick={() => publicar.mutate()}
            disabled={publicar.isPending || texto.trim().length === 0}
            className="flex items-center gap-2 rounded-xl bg-terracota px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-60"
          >
            {publicar.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} strokeWidth={2} />
            )}
            Comentar
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="h-[100px] rounded-2xl border border-borda bg-superficie" />
      ) : comentarios.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-borda-forte px-5 py-8 text-center text-[14px] text-suave">
          Nenhum comentário ainda. Comece a conversa.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {comentarios.map((comentario) => (
              <ItemComentario
                key={comentario.id}
                comentario={comentario}
                podeModerar={podeModerar}
                aoRemover={() => remover.mutate(comentario.id)}
                aoAlternarSpoiler={() =>
                  alternarSpoiler.mutate({ id: comentario.id, spoiler: !comentario.spoiler })
                }
              />
            ))}
          </ul>

          <Paginacao
            pagina={pagina}
            totalPaginas={data?.totalPages ?? 1}
            aoAnterior={() => setPagina((p) => Math.max(0, p - 1))}
            aoProxima={() => setPagina((p) => p + 1)}
          />
        </>
      )}
    </>
  );
}

function ItemComentario({
  comentario,
  podeModerar,
  aoRemover,
  aoAlternarSpoiler,
}: {
  comentario: Comentario;
  podeModerar: boolean;
  aoRemover: () => void;
  aoAlternarSpoiler: () => void;
}) {
  return (
    <li className="rounded-2xl border border-borda bg-superficie p-4">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-[12px] font-semibold text-tinta-2">
            {iniciais(comentario.readerName)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-[13.5px] font-semibold text-tinta">
                {comentario.readerName}
              </span>
              {comentario.mine && (
                <span className="rounded-full bg-creme px-1.5 py-0.5 text-[10.5px] font-semibold text-suave">
                  você
                </span>
              )}
            </div>
            <span className="text-[11.5px] text-suave-2">
              {new Date(comentario.createdAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {podeModerar && (
            <button
              type="button"
              onClick={aoAlternarSpoiler}
              title={comentario.spoiler ? "Desmarcar spoiler" : "Marcar como spoiler"}
              aria-label={comentario.spoiler ? "Desmarcar spoiler" : "Marcar como spoiler"}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                comentario.spoiler
                  ? "bg-terracota-lavagem text-terracota"
                  : "text-suave-2 hover:bg-superficie-2 hover:text-tinta-2"
              }`}
            >
              <EyeOff size={13} strokeWidth={1.9} />
            </button>
          )}
          {(comentario.mine || podeModerar) && (
            <button
              type="button"
              onClick={aoRemover}
              title="Remover comentário"
              aria-label="Remover comentário"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-suave-2 transition hover:bg-erro-lavagem hover:text-erro"
            >
              <Trash2 size={13} strokeWidth={1.9} />
            </button>
          )}
        </div>
      </div>

      <TextoComSpoiler
        texto={comentario.text}
        spoiler={comentario.spoiler}
        className="text-[14.5px] leading-relaxed text-tinta-2"
      />
    </li>
  );
}
