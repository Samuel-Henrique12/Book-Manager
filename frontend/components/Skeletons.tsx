// Placeholders de Carregamento
export default function Skeletons({
  variante = "grade",
  quantidade,
}: {
  variante?: "grade" | "lista";
  quantidade?: number;
}) {
  const itens = Array.from({ length: quantidade ?? (variante === "grade" ? 12 : 6) });
  const pulsar = { animation: "sk 1.3s ease-in-out infinite" };

  if (variante === "lista") {
    return (
      <div className="overflow-hidden rounded-[14px] border border-borda bg-superficie" style={pulsar}>
        {itens.map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 border-b border-borda px-5 py-3 last:border-b-0">
            <div className="aspect-[2/3] w-[38px] shrink-0 rounded-[5px] bg-creme" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-3.5 w-2/5 rounded bg-borda-forte" />
              <div className="h-2.5 w-1/4 rounded bg-superficie-2" />
            </div>
            <div className="hidden h-2.5 w-24 rounded bg-superficie-2 sm:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-x-5 gap-y-7" style={pulsar}>
      {itens.map((_, i) => (
        <div key={i}>
          <div className="aspect-[2/3] w-full rounded-[10px] bg-creme" />
          <div className="mt-3 h-4 w-14 rounded-full bg-superficie-2" />
          <div className="mt-2 h-3.5 w-full rounded bg-borda-forte" />
          <div className="mt-1.5 h-3 w-3/5 rounded bg-superficie-2" />
        </div>
      ))}
    </div>
  );
}
