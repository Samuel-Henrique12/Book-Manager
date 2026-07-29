"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";

// Conteudo Marcado como Spoiler So Aparece Apos o Clique
export default function TextoComSpoiler({
  texto,
  spoiler,
  className = "",
}: {
  texto: string;
  spoiler: boolean;
  className?: string;
}) {
  const [revelado, setRevelado] = useState(false);

  if (spoiler && !revelado) {
    return (
      <button
        type="button"
        onClick={() => setRevelado(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borda-forte bg-superficie-2 px-4 py-3.5 text-[13.5px] font-semibold text-suave transition hover:bg-creme hover:text-tinta-2"
      >
        <EyeOff size={15} strokeWidth={1.9} />
        Contém spoiler — clique para revelar
      </button>
    );
  }

  return <p className={`whitespace-pre-line ${className}`}>{texto}</p>;
}
