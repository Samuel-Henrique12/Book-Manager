"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { obterLivro, removerLivro } from "@/lib/livros";
import { useAlerta } from "@/lib/alerta";
import { useConta } from "@/lib/conta";
import type { Livro } from "@/lib/tipos";
import { obterResumoAvaliacoes } from "@/lib/avaliacoes";
import CapaLivro from "@/components/livro/CapaLivro";
import EstrelasNota from "@/components/ui/EstrelasNota";
import Chip from "@/components/ui/Chip";
import Painel, { TituloSecao } from "@/components/ui/Painel";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import BotaoEstante from "@/components/livro/BotaoEstante";
import DistribuicaoNotas from "@/components/livro/DistribuicaoNotas";
import MinhaAvaliacao from "@/components/livro/MinhaAvaliacao";
import ListaResenhas from "@/components/livro/ListaResenhas";
import ConversaLivro from "@/components/livro/ConversaLivro";

// Página de Detalhe do Livro
export default function PaginaLivro() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const alerta = useAlerta();
  const { data: conta } = useConta();
  const [confirmando, setConfirmando] = useState(false);

  const { data: livro, isPending, isError } = useQuery({
    queryKey: ["livro", id],
    queryFn: () => obterLivro(id),
    enabled: !Number.isNaN(id),
  });

  const { data: resumo } = useQuery({
    queryKey: ["avaliacao", id, "resumo"],
    queryFn: () => obterResumoAvaliacoes(id),
    enabled: !Number.isNaN(id),
  });

  const exclusao = useMutation({
    mutationFn: () => removerLivro(id),
    onSuccess: async () => {
      setConfirmando(false);
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      await alerta.sucesso("Livro excluído");
      router.push("/books");
    },
    onError: () => {
      setConfirmando(false);
      alerta.erro("Não foi possível excluir o livro");
    },
  });

  const podeGerenciar = Boolean(conta?.podeAdministrar);

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-terracota" size={28} />
      </div>
    );
  }

  if (isError || !livro) {
    return (
      <Painel
        titulo="Livro não encontrado"
        descricao="Este título pode ter sido removido do acervo."
        acao={
          <Link
            href="/books"
            className="rounded-xl border border-borda-forte px-5 py-3 text-[15px] font-semibold transition hover:bg-creme"
          >
            Voltar ao acervo
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Link
        href="/books"
        className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-suave transition hover:text-terracota"
      >
        <ChevronLeft size={15} />
        Voltar ao acervo
      </Link>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[200px_minmax(0,1fr)] lg:gap-11">
        {/* Ficha do Livro */}
        <aside className="mx-auto w-[170px] md:mx-0 md:w-full">
          <CapaLivro
            id={livro.id}
            titulo={livro.title}
            autor={livro.author}
            urlCapa={livro.coverUrl}
          />

          <FichaTecnica livro={livro} />

          <BotaoEstante livroId={id} totalDoLivro={livro.pageCount} />

          {podeGerenciar && (
            <div className="mt-5 flex gap-2">
              <Link
                href={`/books/${livro.id}/edit`}
                className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-borda-forte text-[13.5px] font-semibold transition hover:bg-creme"
              >
                <Pencil size={14} strokeWidth={1.9} />
                Editar
              </Link>
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-borda-forte text-tinta-2 transition hover:border-erro/40 hover:bg-erro-lavagem hover:text-erro"
                aria-label="Excluir livro"
                title="Excluir livro"
              >
                <Trash2 size={15} strokeWidth={1.9} />
              </button>
            </div>
          )}
        </aside>

        {/* Conteúdo */}
        <div className="min-w-0">
          <h1 className="font-titulo text-[28px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">
            {livro.title}
          </h1>
          {livro.subtitle && (
            <p className="mt-1 font-serif text-[18px] leading-snug text-tinta-2">
              {livro.subtitle}
            </p>
          )}
          <p className="mt-2 text-[15px] text-suave">{livro.author}</p>

          {livro.averageRating && (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <EstrelasNota nota={Math.round(livro.averageRating)} tamanho={17} />
              <span className="font-titulo text-[19px] font-bold leading-none tabular-nums">
                {livro.averageRating.toFixed(1)}
              </span>
              {livro.ratingsCount ? (
                <span className="text-[13.5px] text-suave">
                  {livro.ratingsCount.toLocaleString("pt-BR")} avaliações no Google Books
                </span>
              ) : null}
            </div>
          )}

          {livro.categories && livro.categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {livro.categories.map((categoria) => (
                <Link key={categoria.slug} href={`/books?categoria=${categoria.slug}`}>
                  <Chip tom="contorno">{categoria.name}</Chip>
                </Link>
              ))}
            </div>
          )}

          <section className="mt-7">
            <h2 className="mb-2.5 text-[11px] font-bold tracking-[0.09em] text-suave-2">SINOPSE</h2>
            {livro.description ? (
              <p className="max-w-[65ch] whitespace-pre-line text-[15.5px] leading-relaxed text-tinta-2">
                {livro.description}
              </p>
            ) : (
              <p className="text-[15px] italic text-suave-2">
                Este livro ainda não tem sinopse cadastrada.
              </p>
            )}
          </section>

          {livro.previewLink && (
            <a
              href={livro.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-terracota transition hover:text-terracota-escuro"
            >
              Ver no Google Books
              <ExternalLink size={14} strokeWidth={2} />
            </a>
          )}
        </div>
      </div>

      {/* Avaliações da Comunidade */}
      <section className="mt-12">
        <TituloSecao>Avaliações dos leitores</TituloSecao>
        <div className="rounded-2xl border border-borda bg-superficie p-5 sm:p-6">
          {resumo ? (
            <DistribuicaoNotas resumo={resumo} />
          ) : (
            <div className="h-[92px]" />
          )}
        </div>

        <div className="mt-4">
          <MinhaAvaliacao livroId={id} />
        </div>

        <div className="mt-6">
          <ListaResenhas livroId={id} />
        </div>
      </section>

      {/* Conversa entre Leitores */}
      <section className="mt-12">
        <TituloSecao>Comentários</TituloSecao>
        <ConversaLivro livroId={id} />
      </section>

      <ModalConfirmacao
        aberto={confirmando}
        titulo="Excluir livro?"
        descricao={
          <>
            Tem certeza que deseja remover <strong className="text-tinta">{livro.title}</strong> do
            acervo? Esta ação não pode ser desfeita.
          </>
        }
        carregando={exclusao.isPending}
        aoCancelar={() => setConfirmando(false)}
        aoConfirmar={() => exclusao.mutate()}
      />
    </>
  );
}

// Dados de Catálogo: Só Aparece o que o Livro Realmente Tem
function FichaTecnica({ livro }: { livro: Livro }) {
  const itens: { rotulo: string; valor: string }[] = [];

  if (livro.publisher) itens.push({ rotulo: "Editora", valor: livro.publisher });
  if (livro.year) itens.push({ rotulo: "Ano", valor: String(livro.year) });
  if (livro.pageCount) {
    itens.push({ rotulo: "Páginas", valor: livro.pageCount.toLocaleString("pt-BR") });
  }
  if (livro.isbn) itens.push({ rotulo: "ISBN", valor: livro.isbn });
  if (livro.language) itens.push({ rotulo: "Idioma", valor: livro.language.toUpperCase() });

  if (itens.length === 0) {
    return null;
  }

  return (
    <dl className="mt-5 space-y-1.5 border-t border-borda pt-4 text-[13px]">
      {itens.map(({ rotulo, valor }) => (
        <div key={rotulo} className="flex gap-2">
          <dt className="shrink-0 text-suave-2">{rotulo}</dt>
          <dd className="min-w-0 break-words text-right text-tinta-2 [margin-left:auto]">
            {valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
