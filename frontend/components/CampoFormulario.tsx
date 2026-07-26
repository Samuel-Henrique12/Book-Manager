"use client";

import { useId, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Comuns {
  rotulo: string;
  rotuloVisivel?: boolean;
  obrigatorio?: boolean;
  dica?: string;
  erro?: string;
  className?: string;
}

const CLASSE_BASE =
  "w-full rounded-xl border bg-superficie text-[15px] text-tinta outline-none transition";

function classeEstado(erro?: string) {
  return erro
    ? "border-erro bg-erro-lavagem focus:shadow-[0_0_0_3px_rgba(196,71,43,0.12)]"
    : "border-borda hover:border-borda-forte focus:border-terracota focus:shadow-[0_0_0_3px_var(--color-terracota-lavagem)]";
}

// Rótulo, Dica e Mensagem de Erro
function Envolucro({
  rotulo,
  rotuloVisivel,
  obrigatorio,
  dica,
  erro,
  idCampo,
  idErro,
  className = "",
  children,
}: Comuns & { idCampo: string; idErro: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label
        htmlFor={idCampo}
        className={
          rotuloVisivel
            ? "mb-1.5 block text-[13px] font-semibold text-tinta-2"
            : "sr-only"
        }
      >
        {rotulo}
        {rotuloVisivel && obrigatorio && <span className="text-terracota"> *</span>}
        {rotuloVisivel && !obrigatorio && dica && (
          <span className="font-normal text-suave-2"> {dica}</span>
        )}
      </label>

      {children}

      {erro && (
        <p id={idErro} role="alert" className="mt-1.5 pl-1 text-[13px] text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}

type PropsCampo = Omit<ComponentPropsWithRef<"input">, "type"> &
  Comuns & {
    icone?: ReactNode;
    senha?: boolean;
    tipo?: string;
  };

// Campo de Texto de Uma Linha
export default function CampoFormulario({
  rotulo,
  rotuloVisivel,
  obrigatorio,
  dica,
  erro,
  icone,
  senha = false,
  tipo = "text",
  className = "",
  ...resto
}: PropsCampo) {
  const [revelada, setRevelada] = useState(false);
  const idBase = useId();
  const idCampo = resto.id ?? `campo-${idBase}`;
  const idErro = `erro-${idBase}`;

  return (
    <Envolucro
      rotulo={rotulo}
      rotuloVisivel={rotuloVisivel}
      obrigatorio={obrigatorio}
      dica={dica}
      erro={erro}
      idCampo={idCampo}
      idErro={idErro}
      className={className}
    >
      <div className="relative">
        {icone && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              erro ? "text-erro" : "text-suave-2"
            }`}
          >
            {icone}
          </span>
        )}

        <input
          {...resto}
          id={idCampo}
          type={senha ? (revelada ? "text" : "password") : tipo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          className={`${CLASSE_BASE} h-[56px] ${icone ? "pl-[46px]" : "pl-4"} ${
            senha ? "pr-[48px]" : "pr-4"
          } ${classeEstado(erro)}`}
        />

        {senha && (
          <button
            type="button"
            onClick={() => setRevelada((v) => !v)}
            aria-label={revelada ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-suave-2 transition hover:bg-superficie-2 hover:text-suave"
          >
            {revelada ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
          </button>
        )}
      </div>
    </Envolucro>
  );
}

type PropsTexto = ComponentPropsWithRef<"textarea"> & Comuns;

// Campo de Texto de Múltiplas Linhas
export function CampoTexto({
  rotulo,
  rotuloVisivel,
  obrigatorio,
  dica,
  erro,
  className = "",
  rows = 4,
  ...resto
}: PropsTexto) {
  const idBase = useId();
  const idCampo = resto.id ?? `campo-${idBase}`;
  const idErro = `erro-${idBase}`;

  return (
    <Envolucro
      rotulo={rotulo}
      rotuloVisivel={rotuloVisivel}
      obrigatorio={obrigatorio}
      dica={dica}
      erro={erro}
      idCampo={idCampo}
      idErro={idErro}
      className={className}
    >
      <textarea
        {...resto}
        id={idCampo}
        rows={rows}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        className={`${CLASSE_BASE} resize-y px-4 py-3.5 leading-relaxed ${classeEstado(erro)}`}
      />
    </Envolucro>
  );
}
