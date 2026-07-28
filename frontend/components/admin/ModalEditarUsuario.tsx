"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { atualizarUsuario } from "@/lib/usuarios";
import { aplicarErro } from "@/lib/erros";
import type { Usuario } from "@/lib/tipos";
import CampoFormulario from "@/components/CampoFormulario";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(150, "Máximo de 150 caracteres"),
});

type Valores = z.infer<typeof schema>;

interface Props {
  usuario: Usuario | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}

// Edição do Nome de um Usuário
export default function ModalEditarUsuario({ usuario, aoFechar, aoSalvar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: { nome: "" } });

  // Recarrega o Formulário a Cada Usuário Aberto
  useEffect(() => {
    if (usuario) reset({ nome: usuario.nome });
  }, [usuario, reset]);

  // Escape e Trava de Rolagem
  useEffect(() => {
    if (!usuario) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = rolagemAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [usuario, aoFechar]);

  const salvar = useMutation({
    mutationFn: (valores: Valores) => atualizarUsuario(usuario!.id, valores.nome.trim()),
    onSuccess: () => {
      toast.success("Usuário atualizado");
      aoSalvar();
      aoFechar();
    },
    onError: (erro) => aplicarErro(erro, setError, "Não foi possível salvar o usuário"),
  });

  if (!usuario || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-painel/55 p-5 backdrop-blur-[3px]"
      style={{ animation: "fade 0.18s ease" }}
      onClick={aoFechar}
    >
      <form
        onSubmit={handleSubmit((valores) => salvar.mutate(valores))}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-editar-usuario"
        className="w-full max-w-[420px] rounded-2xl bg-superficie p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]"
        style={{ animation: "rise 0.22s ease" }}
        onClick={(evento) => evento.stopPropagation()}
      >
        <h3
          id="titulo-editar-usuario"
          className="mb-2 font-titulo text-[21px] font-bold tracking-[-0.025em]"
        >
          Editar usuário
        </h3>
        <p className="mb-6 text-[14px] leading-relaxed text-suave">{usuario.email}</p>

        <CampoFormulario
          rotuloVisivel
          obrigatorio
          autoFocus
          className="mb-7"
          rotulo="Nome"
          placeholder="Nome do usuário"
          erro={errors.nome?.message}
          {...register("nome")}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvar.isPending}
            className="flex items-center gap-2 rounded-xl bg-terracota px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70"
          >
            {salvar.isPending && <Loader2 size={15} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
