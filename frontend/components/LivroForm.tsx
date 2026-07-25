"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { atualizarLivro, criarLivro } from "@/lib/livros";
import { ApiError } from "@/lib/api";
import type { LivroInput } from "@/lib/tipos";
import LivroPreview from "@/components/LivroPreview";

// Validate do Form com Zod
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
});

type FormValues = z.infer<typeof schema>;

// Props do Component LivroForm
interface Props {
  id?: number;
  seed?: number | string;
  valoresIniciais?: FormValues;
}

// Classes de Estilo
const CLASSE_INPUT =
  "w-full rounded-[10px] border border-borda-forte bg-superficie px-3.5 py-3 text-[15px] text-tinta transition focus:border-terracota focus:shadow-[0_0_0_3px_rgba(192,69,31,0.12)]";
const CLASSE_INPUT_ERRO = "border-erro bg-[#fbeee9]";
const CLASSE_LABEL = "mb-1.5 block text-[13px] font-semibold text-[#5c554b]";
const CLASSE_ERRO = "mt-1.5 text-[13px] text-erro";

// Component LivroForm
export default function LivroForm({ id, seed, valoresIniciais }: Props) {
  const edicao = id != null;
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais ?? { titulo: "", autor: "", ano: "", descricao: "" },
  });

  const valores = watch();

  // React Query Mutation pra Salvar Livro
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

  function aoEnviar(v: FormValues) {
    salvar.mutate({
      titulo: v.titulo.trim(),
      autor: v.autor.trim(),
      ano: v.ano ? Number(v.ano) : null,
      descricao: v.descricao.trim() || null,
    });
  }

  return (
    <>
      <Link
        href="/books"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-suave transition hover:text-terracota"
      >
        <ChevronLeft size={15} />
        Voltar para a biblioteca
      </Link>

      <div className="max-w-[900px]">
        <h1 className="mb-1 font-serif text-[32px] font-medium">
          {edicao ? "Editar livro" : "Novo livro"}
        </h1>
        <p className="mb-7 text-[15px] text-suave">
          {edicao
            ? "Atualize as informações deste livro."
            : "Adicione um novo título à sua biblioteca."}
        </p>

        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(0,1fr)_320px]">
          <form
            onSubmit={handleSubmit(aoEnviar)}
            noValidate
            className="rounded-2xl border border-borda bg-superficie p-7"
          >
            <div className="mb-5">
              <label className={CLASSE_LABEL}>
                Título <span className="text-terracota">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex.: Dom Casmurro"
                className={`${CLASSE_INPUT} ${errors.titulo ? CLASSE_INPUT_ERRO : ""}`}
                {...register("titulo")}
              />
              {errors.titulo && <p className={CLASSE_ERRO}>{errors.titulo.message}</p>}
            </div>

            <div className="mb-5">
              <label className={CLASSE_LABEL}>
                Autor <span className="text-terracota">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex.: Machado de Assis"
                className={`${CLASSE_INPUT} ${errors.autor ? CLASSE_INPUT_ERRO : ""}`}
                {...register("autor")}
              />
              {errors.autor && <p className={CLASSE_ERRO}>{errors.autor.message}</p>}
            </div>

            <div className="mb-5 max-w-[200px]">
              <label className={CLASSE_LABEL}>
                Ano <span className="font-normal text-[#b0a897]">(opcional)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Ex.: 1899"
                className={`${CLASSE_INPUT} ${errors.ano ? CLASSE_INPUT_ERRO : ""}`}
                {...register("ano")}
              />
              {errors.ano && <p className={CLASSE_ERRO}>{errors.ano.message}</p>}
            </div>

            <div className="mb-7">
              <label className={CLASSE_LABEL}>
                Descrição <span className="font-normal text-[#b0a897]">(opcional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Uma breve sinopse ou nota sobre o livro..."
                className={`${CLASSE_INPUT} resize-y leading-relaxed ${errors.descricao ? CLASSE_INPUT_ERRO : ""}`}
                {...register("descricao")}
              />
              {errors.descricao && <p className={CLASSE_ERRO}>{errors.descricao.message}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={salvar.isPending}
                className="rounded-[10px] bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
              >
                {salvar.isPending
                  ? "Salvando..."
                  : edicao
                    ? "Salvar alterações"
                    : "Adicionar livro"}
              </button>
              <Link
                href="/books"
                className="rounded-[10px] border border-borda-forte px-5 py-3 text-[15px] font-semibold transition hover:bg-creme"
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
              seed={seed ?? id ?? valores.titulo}
            />
            <p className="mt-3.5 px-0.5 text-[12.5px] leading-relaxed text-suave-2">
              É assim que o livro aparecerá na sua biblioteca.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
