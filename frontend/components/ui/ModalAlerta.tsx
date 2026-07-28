"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, TriangleAlert, X } from "lucide-react";

export type TipoAlerta = "sucesso" | "erro" | "aviso";

// Sucesso se Fecha Sozinho; Erro e Aviso Esperam o Usuário
const DURACAO_SUCESSO = 1600;

const ESTILOS = {
  sucesso: { Icone: Check, classe: "bg-verde/12 text-verde" },
  erro: { Icone: X, classe: "bg-erro-lavagem text-erro" },
  aviso: { Icone: TriangleAlert, classe: "bg-terracota-lavagem text-terracota" },
} as const;

interface Props {
  tipo: TipoAlerta;
  titulo: string;
  texto?: string;
  rotuloBotao?: string;
  aoFechar: () => void;
}

// Aviso Centralizado
export default function ModalAlerta({
  tipo,
  titulo,
  texto,
  rotuloBotao = "Entendi",
  aoFechar,
}: Props) {
  const automatico = tipo === "sucesso";
  const botaoRef = useRef<HTMLButtonElement>(null);

  // Escape, Foco Inicial e Trava de Rolagem
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    botaoRef.current?.focus();

    return () => {
      document.body.style.overflow = rolagemAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aoFechar]);

  // Fechamento Automático do Sucesso
  useEffect(() => {
    if (!automatico) return;
    const timer = setTimeout(aoFechar, DURACAO_SUCESSO);
    return () => clearTimeout(timer);
  }, [automatico, aoFechar]);

  if (typeof document === "undefined") return null;

  const { Icone, classe } = ESTILOS[tipo];

  return createPortal(
    <div
      role={automatico ? "status" : "alertdialog"}
      aria-live={automatico ? "polite" : undefined}
      aria-modal={automatico ? undefined : true}
      aria-labelledby="titulo-alerta"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-painel/55 p-5 backdrop-blur-[3px]"
      style={{ animation: "fade 0.18s ease" }}
      onClick={automatico ? undefined : aoFechar}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl bg-superficie px-7 py-8 text-center shadow-[0_30px_60px_-24px_rgba(60,45,20,0.45)]"
        style={{ animation: "rise 0.24s cubic-bezier(0.2,0.8,0.3,1) both" }}
        onClick={(evento) => evento.stopPropagation()}
      >
        <span
          className={`mx-auto mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-full ${classe}`}
          style={{ animation: "surgir-selo 0.4s cubic-bezier(0.2,1.4,0.4,1) both" }}
        >
          <Icone size={26} strokeWidth={2.6} />
        </span>

        <h2
          id="titulo-alerta"
          className="font-titulo text-[21px] font-bold leading-snug tracking-[-0.025em]"
        >
          {titulo}
        </h2>

        {texto && <p className="mt-2 text-[15px] leading-relaxed text-suave">{texto}</p>}

        {!automatico && (
          <button
            ref={botaoRef}
            type="button"
            onClick={aoFechar}
            className="mt-6 w-full rounded-xl bg-terracota px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro"
          >
            {rotuloBotao}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
