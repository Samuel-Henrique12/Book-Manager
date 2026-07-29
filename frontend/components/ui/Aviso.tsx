"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

type Tom = "info" | "atencao";

const TONS: Record<Tom, string> = {
  info: "border-borda bg-superficie-2 text-suave",
  atencao: "border-amarelo/35 bg-amarelo/10 text-amarelo-escuro",
};

// Faixa Discreta de Recado, sem Bloquear a Tela
export default function Aviso({
  children,
  tom = "info",
  icone,
  dispensavel = false,
  className = "",
}: {
  children: ReactNode;
  tom?: Tom;
  icone?: ReactNode;
  dispensavel?: boolean;
  className?: string;
}) {
  const [visivel, setVisivel] = useState(true);

  if (!visivel) {
    return null;
  }

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed ${TONS[tom]} ${className}`}
    >
      {icone && <span className="mt-px shrink-0">{icone}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {dispensavel && (
        <button
          type="button"
          onClick={() => setVisivel(false)}
          aria-label="Dispensar aviso"
          className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
