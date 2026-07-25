"use client";

import { Loader2, Trash2 } from "lucide-react";

// Props do Component ModalConfirmacao
interface Props {
  aberto: boolean;
  titulo: string;
  carregando?: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}

// Component ModalConfirmacao
export default function ModalConfirmacao({
  aberto,
  titulo,
  carregando,
  aoCancelar,
  aoConfirmar,
}: Props) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,30,25,0.5)] p-5 backdrop-blur-[3px]"
      style={{ animation: "fade 0.18s ease" }}
      onClick={aoCancelar}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl bg-superficie p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]"
        style={{ animation: "rise 0.22s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#fbeee9] text-erro">
          <Trash2 size={22} strokeWidth={1.8} />
        </div>
        <h3 className="mb-2 font-serif text-[22px] font-medium">Excluir livro?</h3>
        <p className="mb-6 text-[15px] leading-relaxed text-suave">
          Tem certeza que deseja remover <strong className="text-tinta">{titulo}</strong>? Esta ação
          não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={aoCancelar}
            className="rounded-[10px] border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
          >
            Cancelar
          </button>
          <button
            onClick={aoConfirmar}
            disabled={carregando}
            className="flex items-center gap-2 rounded-[10px] bg-erro px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#a93a22] disabled:opacity-70"
          >
            {carregando && <Loader2 size={15} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
