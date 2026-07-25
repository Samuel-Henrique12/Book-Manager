// Tamanhos do Logotipo
const TAMANHOS = {
  sm: { icone: 24, texto: "text-[16px]" },
  md: { icone: 32, texto: "text-[21px]" },
  lg: { icone: 40, texto: "text-[26px]" },
} as const;

type Tamanho = keyof typeof TAMANHOS;
type Variante = "claro" | "escuro";

// Símbolo de Livro Aberto
export function SimboloLivro({ tamanho = 32, className }: { tamanho?: number; className?: string }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Página Esquerda */}
      <path
        d="M3.4 9.1a2.2 2.2 0 0 1 2.7-2.14l6.6 1.6A3 3 0 0 1 15 11.5v14.2a1.2 1.2 0 0 1-1.49 1.16l-8.4-2.04a2.2 2.2 0 0 1-1.71-2.14z"
        fill="currentColor"
      />
      {/* Página Direita */}
      <path
        d="M28.6 9.1a2.2 2.2 0 0 0-2.7-2.14l-6.6 1.6A3 3 0 0 0 17 11.5v14.2a1.2 1.2 0 0 0 1.49 1.16l8.4-2.04a2.2 2.2 0 0 0 1.71-2.14z"
        fill="currentColor"
        opacity="0.82"
      />
    </svg>
  );
}

// Logotipo Completo da Marca
export default function Logotipo({
  tamanho = "md",
  variante = "claro",
  className = "",
}: {
  tamanho?: Tamanho;
  variante?: Variante;
  className?: string;
}) {
  const { icone, texto } = TAMANHOS[tamanho];
  const corTexto = variante === "escuro" ? "text-painel-texto" : "text-tinta";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <SimboloLivro tamanho={icone} className="text-terracota" />
      <span className={`${texto} font-bold tracking-[-0.02em] ${corTexto}`}>Book Manager</span>
    </span>
  );
}
