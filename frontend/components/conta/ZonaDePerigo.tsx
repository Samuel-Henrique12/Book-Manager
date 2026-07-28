"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { limparSessao } from "@/lib/auth";
import { excluirMinhaConta } from "@/lib/usuarios";
import ModalConfirmacao from "@/components/ModalConfirmacao";

// Exclusão da Própria Conta com Soft Delete
export default function ZonaDePerigo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);

  const excluir = useMutation({
    mutationFn: excluirMinhaConta,
    onSuccess: () => {
      limparSessao();
      queryClient.clear();
      toast.success("Conta excluída");
      router.push("/login");
      router.refresh();
    },
    onError: (erro) => {
      setAberto(false);
      toast.error(erro instanceof ApiError ? erro.message : "Não foi possível excluir a conta");
    },
  });

  return (
    <>
      <div className="rounded-2xl border border-erro/30 bg-erro-lavagem p-6 sm:p-7">
        <h3 className="mb-1.5 text-[15px] font-semibold text-tinta">Excluir minha conta</h3>
        <p className="mb-5 max-w-[560px] text-[14px] leading-relaxed text-suave">
          Sua conta deixa de existir para o aplicativo e você perde o acesso imediatamente. Se
          mudar de ideia, é possível criar uma conta nova com este mesmo e-mail.
        </p>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded-xl bg-erro px-5 py-3 text-[15px] font-semibold text-white transition hover:brightness-90"
        >
          Excluir conta
        </button>
      </div>

      <ModalConfirmacao
        aberto={aberto}
        titulo="Excluir sua conta?"
        descricao={
          <>
            Você será desconectado e perderá o acesso a esta conta. Esta ação{" "}
            <strong className="text-tinta">não pode ser desfeita</strong>.
          </>
        }
        rotuloConfirmar="Excluir conta"
        carregando={excluir.isPending}
        aoCancelar={() => setAberto(false)}
        aoConfirmar={() => excluir.mutate()}
      />
    </>
  );
}
