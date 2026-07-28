"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

const DURACAO = 1500;

// Confirmação Rápida de Login
export default function ModalBoasVindas({
  nome,
  aoConcluir,
}: {
  nome: string;
  aoConcluir: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(aoConcluir, DURACAO);
    return () => clearTimeout(timer);
  }, [aoConcluir]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-papel/70 p-5 backdrop-blur-[3px]"
      style={{ animation: "fade 0.2s ease-out both" }}
    >
      <div
        className="w-full max-w-[330px] rounded-2xl border border-borda bg-superficie px-7 py-8 text-center shadow-[0_30px_60px_-24px_rgba(60,45,20,0.45)]"
        style={{ animation: "rise 0.28s cubic-bezier(0.2,0.8,0.3,1) both" }}
      >
        <span
          className="mx-auto mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-verde/12 text-verde"
          style={{ animation: "surgir-selo 0.4s cubic-bezier(0.2,1.4,0.4,1) both" }}
        >
          <Check size={26} strokeWidth={2.6} />
        </span>

        <h2 className="font-titulo text-[21px] font-bold leading-snug tracking-[-0.025em]">
          Bem-vindo de volta, {nome.split(/\s+/)[0]}
        </h2>
      </div>
    </div>,
    document.body,
  );
}
