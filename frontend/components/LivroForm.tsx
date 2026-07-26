"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import { atualizarLivro, criarLivro } from "@/lib/livros";
import { ApiError } from "@/lib/api";
import type { LivroInput } from "@/lib/tipos";
import LivroPreview from "@/components/LivroPreview";
import CampoFormulario, { CampoTexto } from "@/components/CampoFormulario";

// Validação do Formulário
const schema = z.object({
  titulo: z.string().trim().min(1, "Informe o título").max(250, "Máximo de 250 caracteres"),
  autor: z.string().trim().min(1, "Informe o autor").max(200, "Máximo de 200 caracteres"),
  ano: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,4}$/.test(v) && +v >= 1 && +v <= 2100), {
      message: "Informe um ano entre 1 e 2100",
    }),
  descricao: z.string().max(5000, "Máximo de 5000 caracteres"),
  urlCapa: z
    .string()
    .trim()
    .max(500, "Máximo de 500 caracteres")
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), {
      message: "Informe uma URL começando com http:// ou https://",
    }),
  isbn: z.string().trim().max(20, "Máximo de 20 caracteres"),
  totalPaginas: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,5}$/.test(v) && +v >= 1), {
      message: "Informe um número de páginas válido",
    }),
});

export type ValoresLivro = z.infer<typeof schema>;

const VAZIO: ValoresLivro = {
  titulo: "",
  autor: "",
  ano: "",
  descricao: "",
  urlCapa: "",
  isbn: "",
  totalPaginas: "",
};

interface Props {
  id?: number;
  seed?: number | string;
  valoresIniciais?: ValoresLivro;
}

// Formulário de Livro
export default function LivroForm({ id, seed, valoresIniciais }: Props) {
  const edicao = id != null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [detalhesAbertos, setDetalhesAbertos] = useState(
    Boolean(valoresIniciais?.urlCapa || valoresIniciais?.isbn || valoresIniciais?.totalPaginas),
  );

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ValoresLivro>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais ?? VAZIO,
  });

  const valores = watch();

  const salvar = useMutation({
    mutationFn: (dto: LivroInput) => (edicao ? atualizarLivro(id, dto) : criarLivro(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livros"] });
      toast.success(edicao ? "Livro atualizado" : "Livro adicionado");
      router.push("/books");
      router.refresh();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.campos) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) =>
          setError(campo as never, { message: mensagem }),
        );
        return;
      }
      toast.error(erro instanceof ApiError ? erro.message : "Não foi possível salvar o livro");
    },
  });

  // Enviar Campos pro Put e Mapper do BackEnd Sobrescrever com Null as Omissões
  function aoEnviar(v: ValoresLivro) {
    salvar.mutate({
      titulo: v.titulo.trim(),
      autor: v.autor.trim(),
      ano: v.ano ? Number(v.ano) : null,
      descricao: v.descricao.trim() || null,
      urlCapa: v.urlCapa.trim() || null,
      isbn: v.isbn.trim() || null,
      totalPaginas: v.totalPaginas ? Number(v.totalPaginas) : null,
    });
  }

  return (
    <>
      <Link
        href="/books"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-suave transition hover:text-terracota"
      >
        <ChevronLeft size={15} />
        Voltar para a estante
      </Link>

      <div className="max-w-[980px]">
        <h1 className="mb-1 font-serif text-[32px] font-medium tracking-[-0.015em]">
          {edicao ? "Editar livro" : "Novo livro"}
        </h1>
        <p className="mb-7 text-[15px] text-suave">
          {edicao
            ? "Atualize as informações deste livro."
            : "Adicione um novo título à sua estante."}
        </p>

        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,1fr)_300px]">
          <form
            onSubmit={handleSubmit(aoEnviar)}
            noValidate
            className="rounded-2xl border border-borda bg-superficie p-6 sm:p-7"
          >
            <CampoFormulario
              rotuloVisivel
              obrigatorio
              className="mb-5"
              rotulo="Título"
              placeholder="Ex.: Dom Casmurro"
              erro={errors.titulo?.message}
              {...register("titulo")}
            />

            <CampoFormulario
              rotuloVisivel
              obrigatorio
              className="mb-5"
              rotulo="Autor"
              placeholder="Ex.: Machado de Assis"
              erro={errors.autor?.message}
              {...register("autor")}
            />

            <CampoFormulario
              rotuloVisivel
              dica="(opcional)"
              className="mb-5 max-w-[200px]"
              rotulo="Ano"
              inputMode="numeric"
              maxLength={4}
              placeholder="Ex.: 1899"
              erro={errors.ano?.message}
              {...register("ano")}
            />

            <CampoTexto
              rotuloVisivel
              dica="(opcional)"
              className="mb-6"
              rotulo="Descrição"
              placeholder="Uma breve sinopse ou nota sobre o livro..."
              erro={errors.descricao?.message}
              {...register("descricao")}
            />

            {/* Detalhes Adicionais */}
            <div className="mb-7 rounded-xl border border-borda">
              <button
                type="button"
                onClick={() => setDetalhesAbertos((v) => !v)}
                aria-expanded={detalhesAbertos}
                className="flex w-full items-center justify-between px-4 py-3.5 text-[14px] font-semibold text-tinta-2 transition hover:text-tinta"
              >
                Detalhes adicionais
                <ChevronDown
                  size={17}
                  className={`text-suave transition ${detalhesAbertos ? "rotate-180" : ""}`}
                />
              </button>

              {detalhesAbertos && (
                <div className="border-t border-borda p-4">
                  <CampoFormulario
                    rotuloVisivel
                    dica="(opcional)"
                    className="mb-4"
                    rotulo="Capa"
                    placeholder="https://exemplo.com/capa.jpg"
                    erro={errors.urlCapa?.message}
                    {...register("urlCapa")}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <CampoFormulario
                      rotuloVisivel
                      dica="(opcional)"
                      rotulo="ISBN"
                      placeholder="978-85-359-0277-5"
                      erro={errors.isbn?.message}
                      {...register("isbn")}
                    />
                    <CampoFormulario
                      rotuloVisivel
                      dica="(opcional)"
                      rotulo="Total de páginas"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="Ex.: 256"
                      erro={errors.totalPaginas?.message}
                      {...register("totalPaginas")}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={salvar.isPending}
                className="flex items-center gap-2 rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
              >
                {salvar.isPending && <Loader2 size={16} className="animate-spin" />}
                {salvar.isPending
                  ? "Salvando..."
                  : edicao
                    ? "Salvar alterações"
                    : "Adicionar livro"}
              </button>
              <Link
                href="/books"
                className="rounded-xl border border-borda-forte px-5 py-3 text-[15px] font-semibold transition hover:bg-creme"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <aside className="md:sticky md:top-9">
            <div className="mb-3 text-[11px] font-bold tracking-[0.09em] text-suave-2">
              PRÉ-VISUALIZAÇÃO
            </div>
            <LivroPreview
              titulo={valores.titulo}
              autor={valores.autor}
              ano={valores.ano}
              descricao={valores.descricao}
              urlCapa={valores.urlCapa}
              seed={seed ?? id ?? valores.titulo}
            />
            <p className="mt-3.5 px-0.5 text-[12.5px] leading-relaxed text-suave-2">
              É assim que o livro aparecerá na sua estante.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
