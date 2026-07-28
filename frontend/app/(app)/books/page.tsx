"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { listarLivros, removerLivro } from "@/lib/livros";
import { listarCategorias } from "@/lib/categorias";
import { useAlerta } from "@/lib/alerta";
import type { LivroResumo } from "@/lib/tipos";
import CampoFormulario from "@/components/CampoFormulario";
import CartaoLivro from "@/components/livro/CartaoLivro";
import ListaLivros from "@/components/livro/ListaLivros";
import Chip from "@/components/ui/Chip";
import Painel from "@/components/ui/Painel";
import Paginacao from "@/components/Paginacao";
import Skeletons from "@/components/Skeletons";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import { SimboloLivro } from "@/components/Logotipo";

const TAMANHO = 12;

// useSearchParams Exige Fronteira de Suspense no Next
export default function PaginaEstante() {
  return (
    <Suspense fallback={<Skeletons variante="grade" />}>
      <Acervo />
    </Suspense>
  );
}

// Página do Acervo
function Acervo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const alerta = useAlerta();
  const categoriaInicial = useSearchParams().get("categoria");

  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [pagina, setPagina] = useState(0);
  const [layout, setLayout] = useState<"grade" | "lista">("grade");
  const [sortCampo, setSortCampo] = useState("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [categoria, setCategoria] = useState<string | null>(categoriaInicial);
  const [alvoExclusao, setAlvoExclusao] = useState<LivroResumo | null>(null);

  // Debounce da Busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAtiva(busca.trim());
      setPagina(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const sort = `${sortCampo},${sortDir}`;
  const { data, isPending, isError } = useQuery({
    queryKey: ["livros", buscaAtiva, categoria, pagina, sort],
    queryFn: () =>
      listarLivros({
        title: buscaAtiva || undefined,
        category: categoria ?? undefined,
        page: pagina,
        size: TAMANHO,
        sort,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
    staleTime: 10 * 60 * 1000,
  });

  const exclusao = useMutation({
    mutationFn: (id: number) => removerLivro(id),
    onSuccess: () => {
      setAlvoExclusao(null);
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      alerta.sucesso("Livro excluído");
    },
    onError: () => {
      setAlvoExclusao(null);
      alerta.erro("Não foi possível excluir o livro");
    },
  });

  const livros = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPaginas = data?.totalPages ?? 1;
  const filtrando = Boolean(buscaAtiva) || categoria !== null;

  function ordenarPor(campo: string) {
    if (sortCampo === campo) {
      setSortDir((direcao) => (direcao === "asc" ? "desc" : "asc"));
    } else {
      setSortCampo(campo);
      setSortDir("asc");
    }
    setPagina(0);
  }

  function limparFiltros() {
    setBusca("");
    setCategoria(null);
    setPagina(0);
  }

  return (
    <>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-titulo text-[30px] font-bold leading-tight tracking-[-0.035em] sm:text-[36px]">
            Acervo
          </h1>
          <p className="mt-1 text-[15px] text-suave">
            {total.toLocaleString("pt-BR")} {total === 1 ? "livro" : "livros"}
            {filtrando && " encontrados"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex gap-0.5 rounded-xl bg-creme p-1">
            <BotaoLayout
              ativo={layout === "grade"}
              onClick={() => setLayout("grade")}
              icone={<LayoutGrid size={15} />}
              rotulo="Grade"
            />
            <BotaoLayout
              ativo={layout === "lista"}
              onClick={() => setLayout("lista")}
              icone={<List size={15} />}
              rotulo="Lista"
            />
          </div>

          <Link
            href="/books/new"
            className="hidden h-[42px] items-center gap-2 rounded-xl bg-terracota px-4 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro sm:inline-flex"
          >
            <Plus size={17} strokeWidth={2.2} />
            Novo livro
          </Link>
        </div>
      </header>

      {/* Categorias Reais do Acervo */}
      {categorias.length > 0 && (
        <div className="-mx-5 mb-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="flex gap-2 pb-1">
            <Chip
              tom="contorno"
              ativo={categoria === null}
              onClick={() => {
                setCategoria(null);
                setPagina(0);
              }}
            >
              Todas as categorias
            </Chip>
            {categorias.map((item) => (
              <Chip
                key={item.slug}
                tom="contorno"
                ativo={categoria === item.slug}
                onClick={() => {
                  setCategoria(categoria === item.slug ? null : item.slug);
                  setPagina(0);
                }}
              >
                {item.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Busca e Ordenação */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <CampoFormulario
          className="min-w-[240px] flex-1"
          rotulo="Buscar por título"
          placeholder="Buscar por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          icone={<Search size={18} strokeWidth={2} />}
        />
        <select
          value={sort}
          onChange={(e) => {
            const [campo, dir] = e.target.value.split(",");
            setSortCampo(campo);
            setSortDir(dir as "asc" | "desc");
            setPagina(0);
          }}
          aria-label="Ordenar"
          className="h-[56px] cursor-pointer rounded-xl border border-borda bg-superficie px-3.5 text-[14px] outline-none transition hover:border-borda-forte focus:border-terracota"
        >
          <option value="title,asc">Título (A–Z)</option>
          <option value="title,desc">Título (Z–A)</option>
          <option value="author,asc">Autor (A–Z)</option>
          <option value="author,desc">Autor (Z–A)</option>
          <option value="averageRating,desc">Melhor avaliados</option>
          <option value="year,desc">Mais recentes</option>
          <option value="year,asc">Mais antigos</option>
          <option value="createdAt,desc">Adicionados por último</option>
        </select>
      </div>

      {isPending ? (
        <Skeletons variante={layout} />
      ) : isError ? (
        <Painel
          titulo="Erro ao carregar"
          descricao="Não foi possível conectar à API. Verifique se o servidor está no ar."
        />
      ) : total === 0 && !filtrando ? (
        <Painel
          tracejado
          icone={<SimboloLivro tamanho={32} />}
          titulo="O acervo está vazio"
          descricao="Cadastre um livro ou peça a um administrador para importar o catálogo do Google Books."
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
      ) : livros.length === 0 ? (
        <Painel
          compacto
          titulo="Nenhum livro encontrado"
          descricao="Tente outro termo de busca ou remova o filtro de categoria."
          acao={
            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-xl border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <>
          {layout === "grade" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-x-5 gap-y-7">
              {livros.map((livro) => (
                <CartaoLivro
                  key={livro.id}
                  livro={livro}
                  aoEditar={(id) => router.push(`/books/${id}/edit`)}
                  aoExcluir={setAlvoExclusao}
                />
              ))}
            </div>
          ) : (
            <ListaLivros
              livros={livros}
              sortCampo={sortCampo}
              sortDir={sortDir}
              aoOrdenar={ordenarPor}
              aoEditar={(id) => router.push(`/books/${id}/edit`)}
              aoExcluir={setAlvoExclusao}
            />
          )}

          <Paginacao
            pagina={pagina}
            totalPaginas={totalPaginas}
            aoAnterior={() => setPagina((p) => Math.max(0, p - 1))}
            aoProxima={() => setPagina((p) => p + 1)}
          />
        </>
      )}

      <ModalConfirmacao
        aberto={alvoExclusao !== null}
        titulo="Excluir livro?"
        descricao={
          <>
            Tem certeza que deseja remover{" "}
            <strong className="text-tinta">{alvoExclusao?.title}</strong>? Esta ação não pode ser
            desfeita.
          </>
        }
        carregando={exclusao.isPending}
        aoCancelar={() => setAlvoExclusao(null)}
        aoConfirmar={() => alvoExclusao && exclusao.mutate(alvoExclusao.id)}
      />
    </>
  );
}

function BotaoLayout({
  ativo,
  onClick,
  icone,
  rotulo,
}: {
  ativo: boolean;
  onClick: () => void;
  icone: React.ReactNode;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={rotulo}
      className={`flex h-[34px] items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold transition ${
        ativo ? "bg-superficie text-tinta shadow-[0_1px_3px_rgba(60,45,20,0.14)]" : "text-suave"
      }`}
    >
      {icone}
      <span className="hidden sm:inline">{rotulo}</span>
    </button>
  );
}
