"use client";

import { useId, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<ComponentPropsWithRef<"input">, "type"> & {
  rotulo: string;
  icone?: ReactNode;
  erro?: string;
  senha?: boolean;
  tipo?: string;
};

// Campo de Texto com Ícone e Erro Acessível
export default function CampoFormulario({
  rotulo,
  icone,
  erro,
  senha = false,
  tipo = "text",
  className = "",
  ...resto
}: Props) {
  const [revelada, setRevelada] = useState(false);
  const idBase = useId();
  const idCampo = resto.id ?? `campo-${idBase}`;
  const idErro = `erro-${idBase}`;

  const tipoFinal = senha ? (revelada ? "text" : "password") : tipo;

  return (
    <div className={className}>
      <label htmlFor={idCampo} className="sr-only">
        {rotulo}
      </label>

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
          type={tipoFinal}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          className={`h-[56px] w-full rounded-xl border bg-superficie text-[15px] text-tinta outline-none transition
            ${icone ? "pl-[46px]" : "pl-4"} ${senha ? "pr-[48px]" : "pr-4"}
            ${
              erro
                ? "border-erro bg-erro-lavagem focus:shadow-[0_0_0_3px_rgba(196,71,43,0.12)]"
                : "border-borda hover:border-borda-forte focus:border-terracota focus:shadow-[0_0_0_3px_var(--color-terracota-lavagem)]"
            }`}
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

      {erro && (
        <p id={idErro} role="alert" className="mt-1.5 pl-1 text-[13px] text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
