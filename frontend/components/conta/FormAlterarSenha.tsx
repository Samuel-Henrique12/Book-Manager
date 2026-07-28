"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { alterarSenha } from "@/lib/usuarios";
import { useAlerta } from "@/lib/alerta";
import { useAplicarErro } from "@/lib/erros";
import CampoFormulario from "@/components/CampoFormulario";

const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual"),
    novaSenha: z
      .string()
      .min(4, "Mínimo de 4 caracteres")
      .max(100, "Máximo de 100 caracteres"),
    confirmacao: z.string().min(1, "Repita a nova senha"),
  })
  .refine((dados) => dados.novaSenha === dados.confirmacao, {
    message: "As senhas não coincidem",
    path: ["confirmacao"],
  });

type Valores = z.infer<typeof schema>;

const VAZIO: Valores = { senhaAtual: "", novaSenha: "", confirmacao: "" };

// Troca de Senha Exigindo a Senha Atual
export default function FormAlterarSenha() {
  const alerta = useAlerta();
  const aplicarErro = useAplicarErro();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: VAZIO });

  const trocar = useMutation({
    mutationFn: (valores: Valores) =>
      alterarSenha({ senhaAtual: valores.senhaAtual, novaSenha: valores.novaSenha }),
    onSuccess: () => {
      reset(VAZIO);
      alerta.sucesso("Senha alterada");
    },
    onError: (erro) => aplicarErro(erro, setError, "Não foi possível alterar a senha"),
  });

  return (
    <form
      onSubmit={handleSubmit((valores) => trocar.mutate(valores))}
      noValidate
      className="rounded-2xl border border-borda bg-superficie p-6 sm:p-7"
    >
      <CampoFormulario
        senha
        rotuloVisivel
        obrigatorio
        className="mb-5"
        rotulo="Senha atual"
        placeholder="Senha atual"
        autoComplete="current-password"
        erro={errors.senhaAtual?.message}
        {...register("senhaAtual")}
      />

      <div className="mb-7 grid gap-5 sm:grid-cols-2">
        <CampoFormulario
          senha
          rotuloVisivel
          obrigatorio
          rotulo="Nova senha"
          placeholder="Mínimo de 4 caracteres"
          autoComplete="new-password"
          erro={errors.novaSenha?.message}
          {...register("novaSenha")}
        />
        <CampoFormulario
          senha
          rotuloVisivel
          obrigatorio
          rotulo="Repetir nova senha"
          placeholder="Digite novamente"
          autoComplete="new-password"
          erro={errors.confirmacao?.message}
          {...register("confirmacao")}
        />
      </div>

      <button
        type="submit"
        disabled={trocar.isPending}
        className="flex items-center gap-2 rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
      >
        {trocar.isPending && <Loader2 size={16} className="animate-spin" />}
        {trocar.isPending ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
