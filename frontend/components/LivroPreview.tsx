import { corLombada, iniciais } from "@/lib/spines";

// Props do Component LivroPreview
interface Props {
  titulo?: string;
  autor?: string;
  ano?: string;
  descricao?: string;
  seed?: number | string;
}

// Component LivroPreview
export default function LivroPreview({ titulo, autor, ano, descricao, seed }: Props) {
  const cor = corLombada(seed ?? titulo ?? "novo");
  const tituloExibido = titulo?.trim() || "Título do livro";
  const iniciaisExibidas = iniciais(titulo?.trim() || "?");

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-borda bg-superficie p-[22px]">
      <div className="absolute inset-y-0 left-0 w-[5px]" style={{ background: cor }} />
      <div className="mb-3.5 flex items-start justify-between">
        <span className="rounded-full bg-superficie-2 px-2.5 py-1 text-[12px] font-semibold text-suave-2">
          {ano?.trim() || "—"}
        </span>
        <div
          className="flex h-11 w-[34px] items-end rounded p-1.5 font-serif text-[13px] text-white/90"
          style={{ background: cor }}
        >
          {iniciaisExibidas}
        </div>
      </div>
      <h3 className="mb-1 font-serif text-[21px] font-medium leading-tight text-pretty">
        {tituloExibido}
      </h3>
      <p className="mb-3 text-[14px] text-suave">{autor?.trim() || "Nome do autor"}</p>
      <p className="text-[13.5px] leading-relaxed text-suave-2">
        {descricao?.trim() || "A descrição aparecerá aqui conforme você digita."}
      </p>
    </div>
  );
}
