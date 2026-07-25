"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

// Props do Component Paginacao
interface Props {
  pagina: number;
  totalPaginas: number;
  aoAnterior: () => void;
  aoProxima: () => void;
}

// Component Paginacao
export default function Paginacao({ pagina, totalPaginas, aoAnterior, aoProxima }: Props) {
  if (totalPaginas <= 1) return null;

  // Classes de Estilo
  const base =
    "flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border bg-superficie transition";
  const ativo = "border-borda-forte text-tinta hover:bg-creme cursor-pointer";
  const inativo = "border-creme text-suave-2 opacity-60 cursor-not-allowed";

  const primeira = pagina <= 0;
  const ultima = pagina >= totalPaginas - 1;

  return (
    <div className="mt-7 flex items-center justify-center gap-4">
      <button
        onClick={aoAnterior}
        disabled={primeira}
        className={`${base} ${primeira ? inativo : ativo}`}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-[14px] font-medium text-tinta-2">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button
        onClick={aoProxima}
        disabled={ultima}
        className={`${base} ${ultima ? inativo : ativo}`}
        aria-label="Próxima página"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
