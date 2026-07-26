"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { listarLivros, removerLivro } from "@/lib/livros";
import { CATEGORIAS, estanteDoLivro } from "@/lib/mock";
import { ROTULO_STATUS } from "@/lib/rotulos";
import type { EstanteItem, LivroResumo, StatusLeitura } from "@/lib/tipos";
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

type Aba = "TODOS" | StatusLeitura | "FAVORITOS";

const ABAS: { chave: Aba; rotulo: string }[] = [
  { chave: "TODOS", rotulo:  "Todos" },
  { chave: "LENDO", rotulo: ROTULO_STATUS.LENDO },
  { chave: "QUERO_LER", rotulo: ROTULO_STATUS.QUERO_LER },
  { chave: "LIDO", rotulo: ROTULO_STATUS.LIDO },
  { chave: "ABANDONADO", rotulo: ROTULO_STATUS.ABANDONADO },
  { chave: "FAVORITOS", rotulo: "Favoritos" },
];

// Página da Estante
export default function PaginaEstante() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [pagina, setPagina] = useState(0);
  const [layout, setLayout] = useState<"grade" | "lista">("grade");
  const [sortCampo, setSortCampo] = useState("titulo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [aba, setAba] = useState<Aba>("TODOS");
  const [categoria, setCategoria] = useState<string | null>(null);
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
    queryKey: ["livros", buscaAtiva, pagina, sort],
    queryFn: () =>
      listarLivros({ titulo: buscaAtiva || undefined, page: pagina, size: TAMANHO, sort }),
    placeholderData: keepPreviousData,
  });

  const exclusao = useMutation({
    mutationFn: (id: number) => removerLivro(id),
    onSuccess: () => {
      toast.success("Livro excluído");
      setAlvoExclusao(null);
      queryClient.invalidateQueries({ queryKey: ["livros"] });
    },
    onError: () => toast.error("Não foi possível excluir o livro"),
  });

  const livros = useMemo(() => data?.conteudo ?? [], [data]);
  const total = data?.totalElementos ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;

  // TODO: Estante Ainda Vem de lib/mock.ts
  const estantes = useMemo(() => {
    const mapa = new Map<number, EstanteItem>();
    livros.forEach((livro) => mapa.set(livro.id, estanteDoLivro(livro)));
    return mapa;
  }, [livros]);

  // Abas e Categorias Filtram a Página Atual em Memória
  // TODO: server-side de Filtros (GET /estante?status=).
  const visiveis = useMemo(() => {
    return livros.filter((livro) => {
      const estante = estantes.get(livro.id);
      if (!estante) return false;
      if (aba === "FAVORITOS" && !estante.favorito) return false;
      if (aba !== "TODOS" && aba !== "FAVORITOS" && estante.status !== aba) return false;
      if (categoria && !estante.categorias.includes(categoria)) return false;
      return true;
    });
  }, [livros, estantes, aba, categoria]);

  const contarAba = (chave: Aba) => {
    if (chave === "TODOS") return livros.length;
    if (chave === "FAVORITOS")
      return livros.filter((l) => estantes.get(l.id)?.favorito).length;
    return livros.filter((l) => estantes.get(l.id)?.status === chave).length;
  };

  function ordenarPor(campo: string) {
    if (sortCampo === campo) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCampo(campo);
      setSortDir("asc");
    }
    setPagina(0);
  }

  const filtrando = aba !== "TODOS" || categoria !== null;

  return (
    <>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-tight tracking-[-0.015em] sm:text-[38px]">
            Minha estante
          </h1>
          <p className="mt-1 text-[15px] text-suave">
            {total} {total === 1 ? "livro" : "livros"}
            {filtrando && ` · ${visiveis.length} nesta página`}
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

      {/* Abas de Status */}
      <div className="-mx-5 mb-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          {ABAS.map(({ chave, rotulo }) => (
            <Chip
              key={chave}
              ativo={aba === chave}
              contagem={contarAba(chave)}
              onClick={() => setAba(chave)}
            >
              {rotulo}
            </Chip>
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div className="-mx-5 mb-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          <Chip tom="contorno" ativo={categoria === null} onClick={() => setCategoria(null)}>
            Todas as categorias
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip
              key={c.slug}
              tom="contorno"
              ativo={categoria === c.slug}
              onClick={() => setCategoria(categoria === c.slug ? null : c.slug)}
            >
              {c.nome}
            </Chip>
          ))}
        </div>
      </div>

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
          <option value="titulo,asc">Título (A–Z)</option>
          <option value="titulo,desc">Título (Z–A)</option>
          <option value="autor,asc">Autor (A–Z)</option>
          <option value="autor,desc">Autor (Z–A)</option>
          <option value="ano,desc">Mais recentes</option>
          <option value="ano,asc">Mais antigos</option>
          <option value="criadoEm,desc">Adicionados por último</option>
        </select>
      </div>

      {isPending ? (
        <Skeletons variante={layout} />
      ) : isError ? (
        <Painel
          titulo="Erro ao carregar"
          descricao="Não foi possível conectar à API. Verifique se o servidor está no ar."
        />
      ) : total === 0 && !buscaAtiva ? (
        <Painel
          tracejado
          icone={<SimboloLivro tamanho={32} />}
          titulo="Sua estante está vazia"
          descricao="Comece adicionando o primeiro livro da sua coleção."
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
      ) : visiveis.length === 0 ? (
        <Painel
          compacto
          titulo="Nenhum livro encontrado"
          descricao={
            filtrando
              ? "Nenhum livro desta página combina com os filtros selecionados."
              : "Tente ajustar a busca."
          }
          acao={
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setAba("TODOS");
                setCategoria(null);
              }}
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
              {visiveis.map((livro) => (
                <CartaoLivro
                  key={livro.id}
                  livro={livro}
                  estante={estantes.get(livro.id) as EstanteItem}
                  aoEditar={(id) => router.push(`/books/${id}/edit`)}
                  aoExcluir={setAlvoExclusao}
                />
              ))}
            </div>
          ) : (
            <ListaLivros
              livros={visiveis}
              estantes={estantes}
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
            <strong className="text-tinta">{alvoExclusao?.titulo}</strong>? Esta ação não pode ser
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
