"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { reenviarConfirmacao } from "@/lib/contas";
import { ApiError } from "@/lib/api";

const ESPERA = 60;

// Mascara o Endereco Mantendo o Reconhecimento
export function mascararEmail(email: string): string {
  const [local, dominio] = email.split("@");
  if (!dominio) return email;
  const visivel = local.slice(0, Math.min(3, local.length));
  return `${visivel}${"*".repeat(Math.max(1, local.length - visivel.length))}@${dominio}`;
}

// Painel de Conta Pendente de Confirmação
export default function AvisoConfirmacao({
  email,
  titulo = "Confirme seu e-mail",
  descricao,
  aoVoltar,
}: {
  email: string;
  titulo?: string;
  descricao?: string;
  aoVoltar: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);

  // Contagem Regressiva do Reenvio
  useEffect(() => {
    if (espera <= 0) return;
    const timer = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [espera]);

  async function reenviar() {
    setEnviando(true);
    try {
      await reenviarConfirmacao(email);
      toast.success("Link reenviado. Confira sua caixa de entrada.");
      setEspera(ESPERA);
    } catch (erro) {
      toast.error(
        erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ animation: "rise 0.35s ease-out both" }}>
      <span className="mb-6 flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-terracota-lavagem text-terracota">
        <MailCheck size={26} strokeWidth={1.8} />
      </span>

      <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.02em]">
        {titulo}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-tinta-2">
        {descricao ?? "Enviamos um link de confirmação para"}{" "}
        <strong className="font-semibold text-tinta">{mascararEmail(email)}</strong>. Abra a
        mensagem e clique no botão para ativar a conta.
      </p>

      <p className="mt-4 rounded-xl border border-borda bg-superficie-2 px-4 py-3 text-[13.5px] leading-relaxed text-suave">
        Não chegou? Confira a caixa de spam. O link vale por 24 horas.
      </p>

      <button
        type="button"
        onClick={reenviar}
        disabled={enviando || espera > 0}
        className="mt-7 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl border border-borda-forte text-[15px] font-semibold text-tinta transition hover:bg-creme disabled:opacity-60"
      >
        {enviando && <Loader2 size={17} className="animate-spin" />}
        {espera > 0 ? `Reenviar em ${espera}s` : "Reenviar link"}
      </button>

      <p className="mt-6 text-center text-[14px] text-suave">
        <button
          type="button"
          onClick={aoVoltar}
          className="font-semibold text-terracota transition hover:text-terracota-escuro hover:underline"
        >
          Voltar para o login
        </button>
      </p>
    </div>
  );
}
