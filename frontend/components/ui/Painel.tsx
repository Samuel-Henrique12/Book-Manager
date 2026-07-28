import type { ReactNode } from "react";

// Caixa de Estado Vazio, Erro ou Aviso
export default function Painel({
  icone,
  titulo,
  descricao,
  acao,
  tracejado = false,
  compacto = false,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  tracejado?: boolean;
  compacto?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border bg-superficie px-5 text-center ${
        tracejado ? "border-dashed border-borda-forte" : "border-borda"
      } ${compacto ? "py-10" : "py-[62px]"}`}
    >
      {icone && (
        <div className="mx-auto mb-5 flex h-[66px] w-[66px] items-center justify-center rounded-2xl bg-terracota-lavagem text-terracota">
          {icone}
        </div>
      )}
      <h2 className="mb-2 font-titulo text-[23px] font-bold tracking-[-0.025em]">{titulo}</h2>
      {descricao && (
        <p className="mx-auto max-w-[420px] text-[15px] leading-relaxed text-suave">{descricao}</p>
      )}
      {acao && <div className="mt-6 flex justify-center">{acao}</div>}
    </div>
  );
}

// Cabeçalho de Seção
export function TituloSecao({
  children,
  acao,
  className = "",
}: {
  children: ReactNode;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className}`}>
      <h2 className="font-titulo text-[19px] font-bold leading-none tracking-[-0.025em]">
        {children}
      </h2>
      {acao}
    </div>
  );
}
