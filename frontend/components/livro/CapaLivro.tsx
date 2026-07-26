"use client";

import { useState } from "react";
import { corLombada, iniciais } from "@/lib/spines";

// Capa do Livro
export default function CapaLivro({
  id,
  titulo,
  autor,
  urlCapa,
  className = "",
  arredondamento = "rounded-[10px]",
}: {
  id: number;
  titulo: string;
  autor?: string | null;
  urlCapa?: string | null;
  className?: string;
  arredondamento?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const cor = corLombada(id);
  const mostrarImagem = Boolean(urlCapa) && !falhou;

  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden bg-creme ${arredondamento} ${className}`}
      style={{ boxShadow: "0 10px 24px -12px rgba(60,45,20,0.45)" }}
    >
      {mostrarImagem ? (
        <img
          src={urlCapa as string}
          alt={`Capa de ${titulo}`}
          loading="lazy"
          onError={() => setFalhou(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-3"
          style={{
            background: `linear-gradient(155deg, ${cor} 0%, rgba(0,0,0,0.42) 100%), ${cor}`,
          }}
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.18em] text-white/55">
            {iniciais(titulo)}
          </span>
          <span>
            <span className="line-clamp-4 font-serif text-[15px] leading-tight text-white/95">
              {titulo}
            </span>
            {autor && (
              <span className="mt-1.5 line-clamp-1 block text-[11px] text-white/60">{autor}</span>
            )}
          </span>
        </div>
      )}

      {/* Lombada e Brilho */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.06) 5%, rgba(0,0,0,0) 9%), linear-gradient(105deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10" />
    </div>
  );
}
