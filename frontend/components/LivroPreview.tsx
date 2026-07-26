import CapaLivro from "@/components/livro/CapaLivro";

interface Props {
  titulo?: string;
  autor?: string;
  ano?: string;
  descricao?: string;
  urlCapa?: string;
  seed?: number | string;
}

// Pré-Visualização do Cartão de Livro
export default function LivroPreview({ titulo, autor, ano, descricao, urlCapa, seed }: Props) {
  const tituloExibido = titulo?.trim() || "Título do livro";
  const autorExibido = autor?.trim() || "Nome do autor";
  const semente = typeof seed === "number" ? seed : somar(String(seed ?? tituloExibido));

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-5">
      <div className="mx-auto w-[132px]">
        <CapaLivro
          id={semente}
          titulo={tituloExibido}
          autor={autor?.trim()}
          urlCapa={urlCapa?.trim() || null}
        />
      </div>

      <h3 className="mt-4 line-clamp-2 font-serif text-[18px] font-medium leading-snug text-pretty">
        {tituloExibido}
      </h3>
      <p className="mt-0.5 text-[13.5px] text-suave">{autorExibido}</p>

      <div className="mt-3 flex items-center gap-2 text-[12px] text-suave-2">
        <span className="rounded-full bg-superficie-2 px-2.5 py-1 font-semibold">
          {ano?.trim() || "—"}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-suave-2">
        {descricao?.trim() || "A descrição aparecerá aqui conforme você digita."}
      </p>
    </div>
  );
}

function somar(texto: string): number {
  return Array.from(texto).reduce((soma, ch) => soma + ch.charCodeAt(0), 0);
}
