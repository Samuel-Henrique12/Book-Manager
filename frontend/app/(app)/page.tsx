"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listarLivros } from "@/lib/livros";
import { eventosRecentes, estanteDoLivro, resumoDaEstante } from "@/lib/mock";
import type { LivroResumo } from "@/lib/tipos";
import Painel, { TituloSecao } from "@/components/ui/Painel";
import { SimboloLivro } from "@/components/Logotipo";
import CapaLivro from "@/components/livro/CapaLivro";
import ResumoLeitura from "@/components/home/ResumoLeitura";
import ContinueLendo from "@/components/home/ContinueLendo";
import Timeline from "@/components/home/Timeline";

const AMOSTRA = 12;

// Página Inicial
export default function PaginaInicio() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["livros", "recentes"],
    queryFn: () => listarLivros({ size: AMOSTRA, sort: "criadoEm,desc" }),
  });

  const livros = data?.conteudo ?? [];
  const total = data?.totalElementos ?? 0;

  // TODO: Estante, Progresso e TimeLine ainda vêm de lib/mock.ts
  const comEstante = livros.map((livro) => ({ livro, estante: estanteDoLivro(livro) }));
  const lendo = comEstante.filter(({ estante }) => estante.status === "LENDO").slice(0, 3);
  const eventos = eventosRecentes(livros);
  const resumo = resumoDaEstante(livros, total);

  if (isError) {
    return (
      <Painel
        titulo="Não foi possível carregar"
        descricao="A API não respondeu. Verifique se o servidor está no ar e tente novamente."
      />
    );
  }

  if (!isPending && total === 0) {
    return (
      <>
        <ResumoLeitura lendo={0} lidos={0} total={0} />
        <Painel
          tracejado
          icone={<SimboloLivro tamanho={32} />}
          titulo="Sua estante está vazia"
          descricao="Adicione o primeiro livro para começar a acompanhar leituras, notas e progresso."
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
        lendo={resumo.lendo}
        lidos={resumo.lidos}
        total={resumo.total}
        carregando={isPending}
      />

      {isPending ? (
        <EsqueletoInicio />
      ) : (
        <>
          {lendo.length > 0 && (
            <section className="mb-11">
              <TituloSecao
                acao={
                  <Link
                    href="/books"
                    className="text-[13.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
                  >
                    Ver estante
                  </Link>
                }
              >
                Continue lendo
              </TituloSecao>
              <ContinueLendo itens={lendo} />
            </section>
          )}

          <div className="grid gap-11 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <section>
              <TituloSecao>Atividade recente</TituloSecao>
              <Timeline eventos={eventos} />
            </section>

            <section>
              <TituloSecao
                acao={
                  <Link
                    href="/books"
                    className="text-[13.5px] font-semibold text-terracota transition hover:text-terracota-escuro"
                  >
                    Ver todos
                  </Link>
                }
              >
                Adicionados
              </TituloSecao>
              <AdicionadosRecentemente livros={livros.slice(0, 6)} />
            </section>
          </div>
        </>
      )}
    </>
  );
}

// Últimos Livros Cadastrados
function AdicionadosRecentemente({ livros }: { livros: LivroResumo[] }) {
  return (
    <div className="grid grid-cols-3 gap-3.5 rounded-2xl border border-borda bg-superficie p-5">
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
        </Link>
      ))}
    </div>
  );
}

function EsqueletoInicio() {
  return (
    <div style={{ animation: "sk 1.3s ease-in-out infinite" }}>
      <div className="mb-4 h-5 w-40 rounded bg-borda-forte" />
      <div className="mb-11 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[116px] rounded-2xl border border-borda bg-superficie" />
        ))}
      </div>
      <div className="grid gap-11 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="h-[320px] rounded-2xl border border-borda bg-superficie" />
        <div className="h-[320px] rounded-2xl border border-borda bg-superficie" />
      </div>
    </div>
  );
}
