"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { listarCategorias } from "@/lib/categorias";
import Chip from "@/components/ui/Chip";

const DESTAQUE_MINIMO = 10;
const VISIVEIS = 12;

// Barra Enxuta de Categorias com Painel de Busca para o Resto
export default function FiltroCategorias({
  selecionada,
  aoSelecionar,
}: {
  selecionada: string | null;
  aoSelecionar: (slug: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const painelRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [temAntes, setTemAntes] = useState(false);
  const [temDepois, setTemDepois] = useState(false);

  // Substitui a Barra de Rolagem por Desvanecimento nas Bordas
  const medirTrilho = useCallback(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const restante = trilho.scrollWidth - trilho.clientWidth - trilho.scrollLeft;
    setTemAntes(trilho.scrollLeft > 4);
    setTemDepois(restante > 4);
  }, []);

  // As Maiores Ficam na Barra; a Lista Cheia So Carrega ao Abrir o Painel
  const { data: destaques = [] } = useQuery({
    queryKey: ["categorias", DESTAQUE_MINIMO],
    queryFn: () => listarCategorias(DESTAQUE_MINIMO),
    staleTime: 10 * 60 * 1000,
  });

  const { data: todas = [] } = useQuery({
    queryKey: ["categorias", 1],
    queryFn: () => listarCategorias(1),
    staleTime: 10 * 60 * 1000,
    enabled: aberto,
  });

  // Escape e Clique Fora Fecham o Painel
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    function aoClicar(evento: MouseEvent) {
      if (painelRef.current && !painelRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicar);
    };
  }, [aberto]);

  useEffect(() => {
    medirTrilho();
    window.addEventListener("resize", medirTrilho);
    return () => window.removeEventListener("resize", medirTrilho);
  }, [medirTrilho, destaques.length, selecionada]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return todas;
    return todas.filter((categoria) => categoria.name.toLowerCase().includes(termo));
  }, [todas, busca]);

  // Categoria Escolhida no Painel Pode Nao Estar Entre as Maiores
  const naBarra = destaques.slice(0, VISIVEIS);
  const foraDaBarra =
    selecionada && !naBarra.some((categoria) => categoria.slug === selecionada)
      ? todas.find((categoria) => categoria.slug === selecionada)
      : undefined;

  function escolher(slug: string) {
    aoSelecionar(selecionada === slug ? null : slug);
    setAberto(false);
    setBusca("");
  }

  return (
    <div className="relative mb-5">
      <div className="relative -mx-5 sm:mx-0">
        {temAntes && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-papel to-transparent"
          />
        )}
        {temDepois && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-papel to-transparent"
          />
        )}

        <div
          ref={trilhoRef}
          onScroll={medirTrilho}
          className="overflow-x-auto px-5 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-2 pb-1">
          <Chip tom="contorno" ativo={selecionada === null} onClick={() => aoSelecionar(null)}>
            Todas
          </Chip>

          {naBarra.map((categoria) => (
            <Chip
              key={categoria.slug}
              tom="contorno"
              ativo={selecionada === categoria.slug}
              contagem={categoria.bookCount ?? undefined}
              onClick={() => escolher(categoria.slug)}
            >
              {categoria.name}
            </Chip>
          ))}

          {foraDaBarra && (
            <Chip
              tom="contorno"
              ativo
              contagem={foraDaBarra.bookCount ?? undefined}
              onClick={() => aoSelecionar(null)}
            >
              {foraDaBarra.name}
            </Chip>
          )}

          <button
            type="button"
            onClick={() => setAberto((valor) => !valor)}
            aria-expanded={aberto}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-borda-forte bg-superficie px-3.5 py-1.5 text-[13.5px] font-semibold text-tinta-2 transition hover:bg-creme"
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
              Todas as categorias
            </button>
          </div>
        </div>
      </div>

      {aberto && (
        <div
          ref={painelRef}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-w-[560px] rounded-2xl border border-borda bg-superficie p-4 shadow-[0_24px_48px_-24px_rgba(60,45,20,0.4)]"
          style={{ animation: "rise 0.18s ease-out both" }}
        >
          <div className="relative mb-3">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-suave-2"
            />
            <input
              autoFocus
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar categoria..."
              aria-label="Buscar categoria"
              className="h-[42px] w-full rounded-xl border border-borda bg-superficie pl-[38px] pr-9 text-[14px] text-tinta outline-none transition focus:border-terracota"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-suave-2 transition hover:bg-superficie-2"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filtradas.length === 0 ? (
              <p className="py-6 text-center text-[13.5px] text-suave">
                Nenhuma categoria com esse nome.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filtradas.map((categoria) => (
                  <Chip
                    key={categoria.slug}
                    tom="contorno"
                    ativo={selecionada === categoria.slug}
                    contagem={categoria.bookCount ?? undefined}
                    onClick={() => escolher(categoria.slug)}
                  >
                    {categoria.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <p className="mt-3 border-t border-borda pt-2.5 text-[12px] text-suave-2">
            {todas.length.toLocaleString("pt-BR")} categorias no acervo
          </p>
        </div>
      )}
    </div>
  );
}
