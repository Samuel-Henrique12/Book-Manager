"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { salvarNome } from "@/lib/auth";
import { CHAVE_CONTA } from "@/lib/conta";
import { atualizarMinhaConta } from "@/lib/usuarios";
import { CLASSE_PERFIL, ROTULO_PERFIL } from "@/lib/rotulos";
import type { Conta } from "@/lib/tipos";
import CampoFormulario from "@/components/CampoFormulario";
import { aplicarErro } from "@/lib/erros";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(150, "Máximo de 150 caracteres"),
});

type Valores = z.infer<typeof schema>;

// Nome, E-mail e Perfil da Conta
export default function FormDadosConta({ conta }: { conta: Conta }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: { nome: conta.nome } });

  const salvar = useMutation({
    mutationFn: (valores: Valores) => atualizarMinhaConta(valores.nome.trim()),
    onSuccess: (atualizada) => {
      salvarNome(atualizada.nome);
      queryClient.setQueryData(CHAVE_CONTA, atualizada);
      reset({ nome: atualizada.nome });
      toast.success("Dados atualizados");
    },
    onError: (erro) => aplicarErro(erro, setError, "Não foi possível salvar seus dados"),
  });

  return (
    <form
      onSubmit={handleSubmit((valores) => salvar.mutate(valores))}
      noValidate
      className="rounded-2xl border border-borda bg-superficie p-6 sm:p-7"
    >
      <CampoFormulario
        rotuloVisivel
        obrigatorio
        className="mb-5"
        rotulo="Nome"
        placeholder="Como você quer ser chamado"
        autoComplete="name"
        erro={errors.nome?.message}
        {...register("nome")}
      />

      <div className="mb-5">
        <label
          htmlFor="campo-email-conta"
          className="mb-1.5 block text-[13px] font-semibold text-tinta-2"
        >
          E-mail
        </label>
        <input
          id="campo-email-conta"
          value={conta.email}
          disabled
          readOnly
          className="h-[56px] w-full cursor-not-allowed rounded-xl border border-borda bg-superficie-2 px-4 text-[15px] text-suave outline-none"
        />
        <p className="mt-1.5 pl-1 text-[13px] text-suave-2">
          O e-mail identifica sua conta e não pode ser alterado.
        </p>
      </div>

      <div className="mb-7">
        <span className="mb-1.5 block text-[13px] font-semibold text-tinta-2">Perfil de acesso</span>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${CLASSE_PERFIL[conta.perfil]}`}
        >
          {ROTULO_PERFIL[conta.perfil]}
        </span>
      </div>

      <button
        type="submit"
        disabled={salvar.isPending || !isDirty}
        className="flex items-center gap-2 rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
      >
        {salvar.isPending && <Loader2 size={16} className="animate-spin" />}
        {salvar.isPending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
