"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

// Modal de Confirmação
export default function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar = "Excluir",
  carregando,
  aoCancelar,
  aoConfirmar,
}: {
  aberto: boolean;
  titulo: string;
  descricao: ReactNode;
  rotuloConfirmar?: string;
  carregando?: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  const confirmarRef = useRef<HTMLButtonElement>(null);

  // Escape, Foco Inicial e Trava de Rolagem
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoCancelar();
    }

    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    confirmarRef.current?.focus();

    return () => {
      document.body.style.overflow = rolagemAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoCancelar]);

  if (!aberto || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-painel/55 p-5 backdrop-blur-[3px]"
      style={{ animation: "fade 0.18s ease" }}
      onClick={aoCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="w-full max-w-[400px] rounded-2xl bg-superficie p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]"
        style={{ animation: "rise 0.22s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-erro-lavagem text-erro">
          <Trash2 size={22} strokeWidth={1.8} />
        </div>

        <h3 id="titulo-modal" className="mb-2 font-titulo text-[21px] font-bold tracking-[-0.025em]">
          {titulo}
        </h3>
        <p className="mb-6 text-[15px] leading-relaxed text-suave">{descricao}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={aoCancelar}
            className="rounded-xl border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
          >
            Cancelar
          </button>
          <button
            ref={confirmarRef}
            type="button"
            onClick={aoConfirmar}
            disabled={carregando}
            className="flex items-center gap-2 rounded-xl bg-erro px-4 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-90 disabled:opacity-70"
          >
            {carregando && <Loader2 size={15} className="animate-spin" />}
            {rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
