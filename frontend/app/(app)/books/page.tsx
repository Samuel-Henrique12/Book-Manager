"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutGrid, Search, Table2 } from "lucide-react";
import { listarLivros, removerLivro } from "@/lib/livros";
import type { LivroResumo } from "@/lib/tipos";
import LivroTabela from "@/components/LivroTabela";
import LivroCards from "@/components/LivroCards";
import Paginacao from "@/components/Paginacao";
import Skeletons from "@/components/Skeletons";
import EstadoVazio from "@/components/EstadoVazio";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import CampoFormulario from "@/components/CampoFormulario";

const TAMANHO = 8;

// Component PaginaLivros
export default function PaginaLivros() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [pagina, setPagina] = useState(0);
  const [layout, setLayout] = useState<"tabela" | "cards">("tabela");
  const [sortCampo, setSortCampo] = useState("titulo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alvoExclusao, setAlvoExclusao] = useState<LivroResumo | null>(null);

  // Atualiza a Busca com DeBounce de 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAtiva(busca.trim());
      setPagina(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  // Query pra Listagem de Livros
  const sort = `${sortCampo},${sortDir}`;
  const { data, isPending, isError } = useQuery({
    queryKey: ["livros", buscaAtiva, pagina, sort],
    queryFn: () =>
      listarLivros({ titulo: buscaAtiva || undefined, page: pagina, size: TAMANHO, sort }),
    placeholderData: keepPreviousData,
  });

  // Mutation para Exclusão de Livro
  const exclusao = useMutation({
    mutationFn: (id: number) => removerLivro(id),
    onSuccess: () => {
      toast.success("Livro excluído");
      setAlvoExclusao(null);
      queryClient.invalidateQueries({ queryKey: ["livros"] });
    },
    onError: () => toast.error("Não foi possível excluir o livro"),
  });

  // Funções de Ordenação

  function ordenarPor(campo: string) {
    if (sortCampo === campo) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCampo(campo);
      setSortDir("asc");
    }
    setPagina(0);
  }

  function aoSelecionarOrdenacao(valor: string) {
    const [campo, dir] = valor.split("-");
    setSortCampo(campo);
    setSortDir(dir as "asc" | "desc");
    setPagina(0);
  }

  // Dados da Listagem
  const livros = data?.conteudo ?? [];
  const total = data?.totalElementos ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;
  const semNenhum = !buscaAtiva && total === 0;
  const semResultado = !!buscaAtiva && total === 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="mb-1 font-serif text-[34px] font-medium">Biblioteca</h1>
          <p className="text-[15px] text-suave">
            {total} {total === 1 ? "livro" : "livros"}
          </p>
        </div>
        <div className="inline-flex gap-0.5 rounded-[11px] bg-creme p-1">
          <BotaoLayout ativo={layout === "tabela"} onClick={() => setLayout("tabela")} icone={<Table2 size={15} />}>
            Tabela
          </BotaoLayout>
          <BotaoLayout ativo={layout === "cards"} onClick={() => setLayout("cards")} icone={<LayoutGrid size={15} />}>
            Cards
          </BotaoLayout>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3.5">
        <CampoFormulario
          className="min-w-[240px] flex-1"
          rotulo="Buscar por título"
          placeholder="Buscar por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          icone={<Search size={18} strokeWidth={2} />}
        />
        {layout === "cards" && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-suave">Ordenar</span>
            <select
              value={`${sortCampo}-${sortDir}`}
              onChange={(e) => aoSelecionarOrdenacao(e.target.value)}
              className="h-[56px] cursor-pointer rounded-xl border border-borda bg-superficie px-3 text-[14px] outline-none transition hover:border-borda-forte focus:border-terracota"
            >
              <option value="titulo-asc">Título (A–Z)</option>
              <option value="titulo-desc">Título (Z–A)</option>
              <option value="autor-asc">Autor (A–Z)</option>
              <option value="ano-asc">Ano (crescente)</option>
              <option value="ano-desc">Ano (decrescente)</option>
            </select>
          </div>
        )}
      </div>

      {isPending ? (
        <Skeletons />
      ) : isError ? (
        <div className="rounded-[18px] border border-borda bg-superficie px-5 py-16 text-center">
          <h2 className="mb-2 font-serif text-[24px] font-medium">Erro ao carregar</h2>
          <p className="text-[15px] text-suave">
            Não foi possível conectar à API. Verifique se o servidor está no ar.
          </p>
        </div>
      ) : semNenhum ? (
        <EstadoVazio variante="vazio" />
      ) : semResultado ? (
        <EstadoVazio variante="sem-resultados" aoLimpar={() => setBusca("")} />
      ) : (
        <>
          {layout === "tabela" ? (
            <LivroTabela
              livros={livros}
              sortCampo={sortCampo}
              sortDir={sortDir}
              aoOrdenar={ordenarPor}
              aoEditar={(id) => router.push(`/books/${id}/edit`)}
              aoExcluir={setAlvoExclusao}
            />
          ) : (
            <LivroCards
              livros={livros}
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
        titulo={alvoExclusao?.titulo ?? ""}
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
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[14px] font-semibold transition ${
        ativo ? "bg-superficie text-tinta shadow-[0_1px_3px_rgba(60,45,20,0.14)]" : "text-suave"
      }`}
    >
      {icone}
      {children}
    </button>
  );
}
