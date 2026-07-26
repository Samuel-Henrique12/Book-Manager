"use client";

import { Pencil, Trash2 } from "lucide-react";

// Botão de Editar ou Excluir
export default function BotaoAcao({
  tipo,
  onClick,
  tamanho = 32,
  className = "",
}: {
  tipo: "editar" | "excluir";
  onClick: () => void;
  tamanho?: number;
  className?: string;
}) {
  const editar = tipo === "editar";
  const rotulo = editar ? "Editar" : "Excluir";
  const icone = tamanho >= 32 ? 15 : 14;

  return (
    <button
      type="button"
      onClick={onClick}
      title={rotulo}
      aria-label={rotulo}
      style={{ width: tamanho, height: tamanho }}
      className={`flex items-center justify-center rounded-lg border border-borda-forte bg-superficie-2 text-tinta-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota ${
        editar
          ? "hover:bg-superficie hover:text-terracota"
          : "hover:border-erro/40 hover:bg-erro-lavagem hover:text-erro"
      } ${className}`}
    >
      {editar ? (
        <Pencil size={icone} strokeWidth={1.9} />
      ) : (
        <Trash2 size={icone} strokeWidth={1.9} />
      )}
    </button>
  );
}
