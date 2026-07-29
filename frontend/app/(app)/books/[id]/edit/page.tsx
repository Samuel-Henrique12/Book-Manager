"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { obterLivro } from "@/lib/livros";
import { useConta } from "@/lib/conta";
import Painel from "@/components/ui/Painel";
import LivroForm from "@/components/LivroForm";

// Component EditarLivro
export default function EditarLivro() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: conta, isPending: carregandoConta } = useConta();

  const { data, isPending, isError } = useQuery({
    queryKey: ["livro", id],
    queryFn: () => obterLivro(id),
    enabled: !Number.isNaN(id),
  });

  // Barrar API Pra Leitores
  if (!carregandoConta && !conta?.podeAdministrar) {
    return (
      <Painel
        icone={<ShieldAlert size={28} strokeWidth={1.7} />}
        titulo="Edição restrita"
        descricao="O acervo é compartilhado entre todos os leitores, por isso só administradores podem editar ou excluir livros."
        acao={
          <Link
            href="/books"
            className="rounded-xl border border-borda-forte px-5 py-3 text-[15px] font-semibold transition hover:bg-creme"
          >
            Voltar ao acervo
          </Link>
        }
      />
    );
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-terracota" size={28} />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-[15px] text-suave">Livro não encontrado.</p>;
  }

  return (
    <LivroForm
      id={id}
      seed={data.id}
      valoresIniciais={{
        title: data.title,
        author: data.author,
        year: data.year != null ? String(data.year) : "",
        description: data.description ?? "",
        coverUrl: data.coverUrl ?? "",
        isbn: data.isbn ?? "",
        pageCount: data.pageCount != null ? String(data.pageCount) : "",
      }}
    />
  );
}
