"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { obterLivro } from "@/lib/livros";
import LivroForm from "@/components/LivroForm";

// Component EditarLivro
export default function EditarLivro() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isPending, isError } = useQuery({
    queryKey: ["livro", id],
    queryFn: () => obterLivro(id),
    enabled: !Number.isNaN(id),
  });

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
