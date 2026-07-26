// Progresso de Leitura em Páginas
export default function BarraProgresso({
  paginaAtual,
  totalPaginas,
  compacta = false,
  className = "",
}: {
  paginaAtual: number;
  totalPaginas: number;
  compacta?: boolean;
  className?: string;
}) {
  const percentual =
    totalPaginas > 0 ? Math.min(100, Math.round((paginaAtual / totalPaginas) * 100)) : 0;

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso de leitura: ${percentual}%`}
        className={`w-full overflow-hidden rounded-full bg-creme ${compacta ? "h-1" : "h-1.5"}`}
      >
        <div
          className="h-full rounded-full bg-terracota transition-[width] duration-500"
          style={{ width: `${percentual}%` }}
        />
      </div>
      {!compacta && (
        <div className="mt-1.5 flex items-center justify-between text-[12px] text-suave">
          <span className="tabular-nums">
            p. {paginaAtual} de {totalPaginas}
          </span>
          <span className="font-semibold tabular-nums text-terracota">{percentual}%</span>
        </div>
      )}
    </div>
  );
}
