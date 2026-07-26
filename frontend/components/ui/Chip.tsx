import type { ReactNode } from "react";

type Tom = "neutro" | "marca" | "contorno";

const TONS: Record<Tom, { ativo: string; inativo: string }> = {
  neutro: {
    ativo: "bg-tinta text-papel border-tinta",
    inativo: "bg-superficie text-tinta-2 border-borda hover:border-borda-forte",
  },
  marca: {
    ativo: "bg-terracota text-white border-terracota",
    inativo: "bg-superficie text-tinta-2 border-borda hover:border-borda-forte",
  },
  contorno: {
    ativo: "bg-terracota-lavagem text-terracota-escuro border-terracota/35",
    inativo: "bg-transparent text-suave border-borda hover:text-tinta-2 hover:border-borda-forte",
  },
};

// Pílula de Filtro, Aba ou Badge
export default function Chip({
  children,
  ativo = false,
  tom = "neutro",
  contagem,
  onClick,
  titulo,
  className = "",
}: {
  children: ReactNode;
  ativo?: boolean;
  tom?: Tom;
  contagem?: number;
  onClick?: () => void;
  titulo?: string;
  className?: string;
}) {
  const cores = TONS[tom][ativo ? "ativo" : "inativo"];
  const base = `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition ${cores} ${className}`;

  const conteudo = (
    <>
      {children}
      {contagem !== undefined && (
        <span className={`text-[12px] tabular-nums ${ativo ? "opacity-70" : "text-suave-2"}`}>
          {contagem}
        </span>
      )}
    </>
  );

  if (!onClick) {
    return <span className={base}>{conteudo}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      aria-pressed={ativo}
      className={`${base} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota`}
    >
      {conteudo}
    </button>
  );
}
