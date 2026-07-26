import type { EventoTimeline } from "@/lib/tipos";
import ItemTimeline from "./ItemTimeline";

// Feed de Atividade
export default function Timeline({ eventos }: { eventos: EventoTimeline[] }) {
  if (eventos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-borda-forte bg-superficie px-5 py-10 text-center text-[14px] text-suave">
        Sua atividade de leitura aparece aqui conforme você usa a estante.
      </p>
    );
  }

  return (
    <ol className="rounded-2xl border border-borda bg-superficie p-5">
      {eventos.map((evento) => (
        <ItemTimeline key={evento.id} evento={evento} />
      ))}
    </ol>
  );
}
