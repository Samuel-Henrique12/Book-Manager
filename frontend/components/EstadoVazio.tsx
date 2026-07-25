import Link from "next/link";
import { BookMarked, Plus } from "lucide-react";

// Component pra Exibir State Vazio da Estante de Livros
interface Props {
  variante: "vazio" | "sem-resultados";
  aoLimpar?: () => void;
}

// Component EstadoVazio
export default function EstadoVazio({ variante, aoLimpar }: Props) {
  if (variante === "sem-resultados") {
    return (
      <div className="rounded-[18px] border border-borda bg-superficie px-5 py-16 text-center">
        <h2 className="mb-2 font-serif text-[24px] font-medium">Nenhum livro encontrado</h2>
        <p className="mb-5 text-[15px] text-suave">Tente ajustar a busca.</p>
        {aoLimpar && (
          <button
            onClick={aoLimpar}
            className="rounded-[10px] border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
          >
            Limpar busca
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-dashed border-[#dcd2be] bg-superficie px-5 py-[70px] text-center">
      <div className="mx-auto mb-5 flex h-[66px] w-[66px] items-center justify-center rounded-2xl bg-creme text-[#b79a5e]">
        <BookMarked size={30} strokeWidth={1.6} />
      </div>
      <h2 className="mb-2 font-serif text-[26px] font-medium">Sua estante está vazia</h2>
      <p className="mb-6 text-[15px] text-suave">
        Comece adicionando o primeiro livro da sua coleção.
      </p>
      <Link
        href="/books/new"
        className="inline-flex items-center gap-2 rounded-[10px] bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro"
      >
        <Plus size={17} strokeWidth={2.2} />
        Adicionar livro
      </Link>
    </div>
  );
}
