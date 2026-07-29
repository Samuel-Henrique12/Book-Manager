"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookOpen, Heart, Library, ScrollText } from "lucide-react";
import { listarEstante, obterResumoEstante } from "@/lib/estante";
import { FITA_STATUS, ROTULO_STATUS } from "@/lib/rotulos";
import type { ItemEstante, StatusLeitura } from "@/lib/tipos";
import CapaLivro from "@/components/livro/CapaLivro";
import BarraProgresso from "@/components/ui/BarraProgresso";
import Chip from "@/components/ui/Chip";
import Painel from "@/components/ui/Painel";
import Paginacao from "@/components/Paginacao";
import Skeletons from "@/components/Skeletons";

type Aba = "TODOS" | StatusLeitura | "FAVORITOS";

const ABAS: { chave: Aba; rotulo: string }[] = [
  { chave: "TODOS", rotulo: "Todos" },
  { chave: "LENDO", rotulo: ROTULO_STATUS.LENDO },
  { chave: "QUERO_LER", rotulo: ROTULO_STATUS.QUERO_LER },
  { chave: "LIDO", rotulo: ROTULO_STATUS.LIDO },
  { chave: "ABANDONADO", rotulo: ROTULO_STATUS.ABANDONADO },
  { chave: "FAVORITOS", rotulo: "Favoritos" },
];

// Página da Estante do Leitor
export default function PaginaEstante() {
  const [aba, setAba] = useState<Aba>("TODOS");
  const [pagina, setPagina] = useState(0);

  const { data: resumo } = useQuery({
    queryKey: ["estante", "resumo"],
    queryFn: obterResumoEstante,
  });

  const { data, isPending, isError } = useQuery({
    queryKey: ["estante", "lista", aba, pagina],
    queryFn: () =>
      listarEstante({
        status: aba === "TODOS" || aba === "FAVORITOS" ? null : aba,
        favorites: aba === "FAVORITOS",
        page: pagina,
      }),
    placeholderData: keepPreviousData,
  });

  const itens = data?.content ?? [];

  function contar(chave: Aba): number | undefined {
    if (!resumo) return undefined;
    if (chave === "TODOS") return resumo.total;
    if (chave === "FAVORITOS") return resumo.favorites;
    const mapa: Record<StatusLeitura, number> = {
      QUERO_LER: resumo.wantToRead,
      LENDO: resumo.reading,
      LIDO: resumo.read,
      ABANDONADO: resumo.abandoned,
    };
    return mapa[chave];
  }

  return (
    <>
      <header className="mb-7">
        <h1 className="font-titulo text-[30px] font-bold leading-tight tracking-[-0.035em] sm:text-[36px]">
          Minha estante
        </h1>
        <p className="mt-1 text-[15px] text-suave">
          Seus livros marcados, com progresso de leitura.
        </p>
      </header>

      {/* Paginômetro e Contadores */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica Icone={ScrollText} valor={resumo?.pagesRead} rotulo="páginas lidas" destaque />
        <Metrica Icone={Library} valor={resumo?.read} rotulo="livros lidos" />
        <Metrica Icone={BookOpen} valor={resumo?.reading} rotulo="lendo agora" />
        <Metrica Icone={Heart} valor={resumo?.favorites} rotulo="favoritos" />
      </div>

      <div className="-mx-5 mb-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          {ABAS.map(({ chave, rotulo }) => (
            <Chip
              key={chave}
              ativo={aba === chave}
              contagem={contar(chave)}
              onClick={() => {
                setAba(chave);
                setPagina(0);
              }}
            >
              {rotulo}
            </Chip>
          ))}
        </div>
      </div>

      {isPending ? (
        <Skeletons variante="grade" />
      ) : isError ? (
        <Painel
          titulo="Erro ao carregar"
          descricao="Não foi possível buscar sua estante. Tente novamente em instantes."
        />
      ) : itens.length === 0 ? (
        <Painel
          tracejado
          icone={<Library size={28} strokeWidth={1.7} />}
          titulo={aba === "TODOS" ? "Sua estante está vazia" : "Nada por aqui"}
          descricao={
            aba === "TODOS"
              ? "Abra um livro do acervo e escolha um status para começar a acompanhar suas leituras."
              : "Você ainda não tem livros com esse marcador."
          }
          acao={
            <Link
              href="/books"
              className="rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro"
            >
              Explorar o acervo
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-x-5 gap-y-7">
            {itens.map((item) => (
              <CartaoEstante key={item.id} item={item} />
            ))}
          </div>

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

function Metrica({
  Icone,
  valor,
  rotulo,
  destaque = false,
}: {
  Icone: typeof Library;
  valor?: number;
  rotulo: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        destaque ? "border-terracota/25 bg-terracota-lavagem" : "border-borda bg-superficie"
      }`}
    >
      <Icone
        size={17}
        strokeWidth={1.9}
        className={destaque ? "text-terracota" : "text-suave-2"}
      />
      <div className="mt-2 font-titulo text-[23px] font-bold leading-none tabular-nums tracking-[-0.02em]">
        {valor?.toLocaleString("pt-BR") ?? "—"}
      </div>
      <div className="mt-1 text-[12.5px] text-suave">{rotulo}</div>
    </div>
  );
}

function CartaoEstante({ item }: { item: ItemEstante }) {
  const emLeitura = item.status === "LENDO" && item.currentPage != null && item.totalPages;

  return (
    <article className="group relative">
      <Link
        href={`/books/${item.book.id}`}
        aria-label={`Abrir ${item.book.title}`}
        className="block rounded-[10px] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracota group-hover:-translate-y-1"
      >
        <CapaLivro
          id={item.book.id}
          titulo={item.book.title}
          autor={item.book.author}
          urlCapa={item.book.coverUrl}
        />
      </Link>

      <span
        className={`pointer-events-none absolute left-0 top-3 rounded-r-md py-1 pl-2 pr-2.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_2px_6px_rgba(60,45,20,0.35)] ${FITA_STATUS[item.status]}`}
      >
        {ROTULO_STATUS[item.status]}
      </span>

      {item.favorite && (
        <span
          role="img"
          aria-label="Favorito"
          className="pointer-events-none absolute bottom-2 left-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-superficie/92 shadow-[0_2px_8px_rgba(60,45,20,0.28)]"
        >
          <Heart size={13} className="fill-terracota text-terracota" />
        </span>
      )}

      <div className="mt-3">
        <h3 className="line-clamp-2 font-serif text-[16px] font-medium leading-snug text-pretty">
          {item.book.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-suave">{item.book.author}</p>

        <div className="mt-2 min-h-[18px]">
          {emLeitura ? (
            <BarraProgresso
              compacta
              paginaAtual={item.currentPage as number}
              totalPaginas={item.totalPages as number}
            />
          ) : (
            <span className="text-[12px] text-suave-2">{item.book.year ?? "—"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
