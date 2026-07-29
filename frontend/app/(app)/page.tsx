"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Heart, Library, Plus, ScrollText } from "lucide-react";
import { listarLivros } from "@/lib/livros";
import { listarCategorias } from "@/lib/categorias";
import { listarEstante, obterResumoEstante } from "@/lib/estante";
import type { LivroResumo } from "@/lib/tipos";
import Painel, { TituloSecao } from "@/components/ui/Painel";
import Metrica from "@/components/ui/Metrica";
import EstrelasNota from "@/components/ui/EstrelasNota";
import { SimboloLivro } from "@/components/Logotipo";
import CapaLivro from "@/components/livro/CapaLivro";
import CardCategoria from "@/components/livro/CardCategoria";
import ResumoLeitura from "@/components/home/ResumoLeitura";
import ContinueLendo from "@/components/home/ContinueLendo";
import FeedAtividade from "@/components/home/FeedAtividade";

const VITRINE = 6;
const CATEGORIAS_EM_DESTAQUE = 10;

// Página Inicial
export default function PaginaInicio() {
  const recentes = useQuery({
    queryKey: ["livros", "recentes"],
    queryFn: () => listarLivros({ size: VITRINE, sort: "createdAt,desc" }),
  });

  const destaques = useQuery({
    queryKey: ["livros", "destaques"],
    queryFn: () => listarLivros({ size: VITRINE, sort: "averageRating,desc" }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias", CATEGORIAS_EM_DESTAQUE],
    queryFn: () => listarCategorias(CATEGORIAS_EM_DESTAQUE),
    staleTime: 10 * 60 * 1000,
  });

  const { data: resumo } = useQuery({
    queryKey: ["estante", "resumo"],
    queryFn: obterResumoEstante,
  });

  const { data: lendo } = useQuery({
    queryKey: ["estante", "lista", "LENDO", 0],
    queryFn: () => listarEstante({ status: "LENDO", page: 0 }),
  });

  const total = recentes.data?.totalElements ?? 0;
  const carregando = recentes.isPending;
  const listaDestaques = (destaques.data?.content ?? []).filter((livro) => livro.averageRating);
  const emLeitura = (lendo?.content ?? []).slice(0, 3);
  const temEstante = (resumo?.total ?? 0) > 0;

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

      {/* A Leitura do Proprio Usuario Vem Antes do Acervo */}
      {temEstante ? (
        <section className="mb-11">
          <TituloSecao
            acao={
              <Link
                href="/estante"
                className="text-[13.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
              >
                Ver minha estante
              </Link>
            }
          >
            Sua leitura
          </TituloSecao>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica Icone={ScrollText} valor={resumo?.pagesRead} rotulo="páginas lidas" destaque />
            <Metrica Icone={Library} valor={resumo?.read} rotulo="livros lidos" />
            <Metrica Icone={BookOpen} valor={resumo?.reading} rotulo="lendo agora" />
            <Metrica Icone={Heart} valor={resumo?.favorites} rotulo="favoritos" />
          </div>

          {emLeitura.length > 0 && (
            <div className="mt-5">
              <ContinueLendo itens={emLeitura} />
            </div>
          )}
        </section>
      ) : (
        !carregando && (
          <section className="mb-11">
            <Painel
              compacto
              tracejado
              icone={<Library size={26} strokeWidth={1.7} />}
              titulo="Comece sua estante"
              descricao="Escolha um livro do acervo e marque como Quero ler ou Lendo para acompanhar seu progresso por aqui."
              acao={
                <Link
                  href="/books"
                  className="rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro"
                >
                  Explorar o acervo
                </Link>
              }
            />
          </section>
        )
      )}

      {carregando ? (
        <EsqueletoInicio />
      ) : (
        <>
          <div className="grid gap-11 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <section className="mb-11">
                <TituloSecao acao={<AtalhoAcervo />}>Adicionados recentemente</TituloSecao>
                <Vitrine livros={recentes.data?.content ?? []} />
              </section>

              {listaDestaques.length > 0 && (
                <section>
                  <TituloSecao acao={<AtalhoAcervo rotulo="Ver melhor avaliados" />}>
                    Destaques
                  </TituloSecao>
                  <Vitrine livros={listaDestaques} mostrarNota />
                </section>
              )}
            </div>

            <section className="min-w-0">
              <TituloSecao>Na comunidade</TituloSecao>
              <FeedAtividade quantidade={6} />
            </section>
          </div>

          {categorias.length > 0 && (
            <section className="mt-11">
              <TituloSecao
                acao={
                  <Link
                    href="/books"
                    className="text-[13.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
                  >
                    Ver todas
                  </Link>
                }
              >
                Navegue por categoria
              </TituloSecao>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {categorias.map((categoria) => (
                  <CardCategoria key={categoria.slug} categoria={categoria} />
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
    <div className="grid grid-cols-3 gap-4 rounded-2xl border border-borda bg-superficie p-5 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
      {livros.map((livro) => (
        <Link
          key={livro.id}
          href={`/books/${livro.id}`}
          title={`${livro.title} — ${livro.author}`}
          className="group block"
        >
          <CapaLivro
            id={livro.id}
            titulo={livro.title}
            urlCapa={livro.coverUrl}
            className="transition duration-300 group-hover:-translate-y-1"
            arredondamento="rounded-lg"
          />
          <span className="mt-2 line-clamp-2 block text-[12.5px] leading-snug text-tinta-2">
            {livro.title}
          </span>
          {mostrarNota && livro.averageRating && (
            <span className="mt-1 flex items-center gap-1.5">
              <EstrelasNota nota={Math.round(livro.averageRating)} tamanho={11} />
              <span className="text-[11px] text-suave-2">{livro.averageRating.toFixed(1)}</span>
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
