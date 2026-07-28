"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listarLivros } from "@/lib/livros";
import { listarCategorias } from "@/lib/categorias";
import type { LivroResumo } from "@/lib/tipos";
import Painel, { TituloSecao } from "@/components/ui/Painel";
import Chip from "@/components/ui/Chip";
import EstrelasNota from "@/components/ui/EstrelasNota";
import { SimboloLivro } from "@/components/Logotipo";
import CapaLivro from "@/components/livro/CapaLivro";
import ResumoLeitura from "@/components/home/ResumoLeitura";

const VITRINE = 6;

// Página Inicial
export default function PaginaInicio() {
  const recentes = useQuery({
    queryKey: ["livros", "recentes"],
    queryFn: () => listarLivros({ size: VITRINE, sort: "criadoEm,desc" }),
  });

  const destaques = useQuery({
    queryKey: ["livros", "destaques"],
    queryFn: () => listarLivros({ size: VITRINE, sort: "mediaAvaliacao,desc" }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
    staleTime: 10 * 60 * 1000,
  });

  const total = recentes.data?.totalElementos ?? 0;
  const carregando = recentes.isPending;
  const listaDestaques = (destaques.data?.conteudo ?? []).filter((livro) => livro.mediaAvaliacao);

  if (recentes.isError) {
    return (
      <Painel
        titulo="Não foi possível carregar"
        descricao="A API não respondeu. Verifique se o servidor está no ar e tente novamente."
      />
    );
  }

  if (!carregando && total === 0) {
    return (
      <>
        <ResumoLeitura total={0} categorias={0} avaliados={0} />
        <Painel
          tracejado
          icone={<SimboloLivro tamanho={32} />}
          titulo="O acervo está vazio"
          descricao="Cadastre o primeiro livro ou peça a um administrador para importar o catálogo do Google Books."
          acao={
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro"
            >
              <Plus size={17} strokeWidth={2.2} />
              Adicionar livro
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <ResumoLeitura
        total={total}
        categorias={categorias.length}
        avaliados={listaDestaques.length}
        carregando={carregando}
      />

      {carregando ? (
        <EsqueletoInicio />
      ) : (
        <>
          <section className="mb-11">
            <TituloSecao acao={<AtalhoAcervo />}>Adicionados recentemente</TituloSecao>
            <Vitrine livros={recentes.data?.conteudo ?? []} />
          </section>

          {listaDestaques.length > 0 && (
            <section className="mb-11">
              <TituloSecao acao={<AtalhoAcervo rotulo="Ver melhor avaliados" />}>
                Destaques
              </TituloSecao>
              <Vitrine livros={listaDestaques} mostrarNota />
            </section>
          )}

          {categorias.length > 0 && (
            <section>
              <TituloSecao>Navegue por categoria</TituloSecao>
              <div className="flex flex-wrap gap-2">
                {categorias.slice(0, 18).map((categoria) => (
                  <Link key={categoria.slug} href={`/books?categoria=${categoria.slug}`}>
                    <Chip tom="contorno">{categoria.nome}</Chip>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function AtalhoAcervo({ rotulo = "Ver acervo" }: { rotulo?: string }) {
  return (
    <Link
      href="/books"
      className="text-[13.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
    >
      {rotulo}
    </Link>
  );
}

// Faixa de Capas do Acervo
function Vitrine({ livros, mostrarNota = false }: { livros: LivroResumo[]; mostrarNota?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4 rounded-2xl border border-borda bg-superficie p-5 sm:grid-cols-6">
      {livros.map((livro) => (
        <Link
          key={livro.id}
          href={`/books/${livro.id}/edit`}
          title={`${livro.titulo} — ${livro.autor}`}
          className="group block"
        >
          <CapaLivro
            id={livro.id}
            titulo={livro.titulo}
            urlCapa={livro.urlCapa}
            className="transition duration-300 group-hover:-translate-y-1"
            arredondamento="rounded-lg"
          />
          <span className="mt-2 line-clamp-2 block text-[12.5px] leading-snug text-tinta-2">
            {livro.titulo}
          </span>
          {mostrarNota && livro.mediaAvaliacao && (
            <span className="mt-1 flex items-center gap-1.5">
              <EstrelasNota nota={Math.round(livro.mediaAvaliacao)} tamanho={11} />
              <span className="text-[11px] text-suave-2">{livro.mediaAvaliacao.toFixed(1)}</span>
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function EsqueletoInicio() {
  return (
    <div style={{ animation: "sk 1.3s ease-in-out infinite" }}>
      <div className="mb-4 h-5 w-52 rounded bg-borda-forte" />
      <div className="mb-11 h-[220px] rounded-2xl border border-borda bg-superficie" />
      <div className="mb-4 h-5 w-40 rounded bg-borda-forte" />
      <div className="h-[220px] rounded-2xl border border-borda bg-superficie" />
    </div>
  );
}
