export interface RespostaPaginada<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
}

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  ano?: number | null;
  descricao?: string | null;
  urlCapa?: string | null;
  isbn?: string | null;
  totalPaginas?: number | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type LivroResumo = Pick<
  Livro,
  "id" | "titulo" | "autor" | "ano" | "descricao" | "urlCapa"
>;

// Interface para Input de Livro
export interface LivroInput {
  titulo: string;
  autor: string;
  ano?: number | null;
  descricao?: string | null;
}

// Interface para Resposta de Token
export interface TokenResposta {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
}

// Interface para Detalhes de Problema
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  campos?: Record<string, string>;
}
