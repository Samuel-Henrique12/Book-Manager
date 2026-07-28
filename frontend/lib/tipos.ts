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
  urlCapa?: string | null;
  isbn?: string | null;
  totalPaginas?: number | null;
}

// TODO :
// Contratos das Fases 2-5 do Backend
// Ainda não existem na API — ver .planejamento/README.md

export type StatusLeitura = "QUERO_LER" | "LENDO" | "LIDO" | "ABANDONADO";

export interface Categoria {
  slug: string;
  nome: string;
}

export interface EstanteItem {
  status: StatusLeitura;
  favorito: boolean;
  nota: number | null;
  paginaAtual: number | null;
  totalPaginas: number | null;
  categorias: string[];
}

export type TipoEvento =
  | "ADICIONOU"
  | "INICIOU"
  | "TERMINOU"
  | "AVALIOU"
  | "FAVORITOU"
  | "ABANDONOU"
  | "PROGREDIU";

export interface EventoTimeline {
  id: string;
  tipo: TipoEvento;
  livroId: number;
  livroTitulo: string;
  quando: string;
  nota?: number | null;
  comentario?: string | null;
  spoiler?: boolean;
}

// Perfil de Acesso
export type Perfil = "USUARIO" | "ADMIN";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  emailConfirmado: boolean;
  criadoEm: string;
}

// Conta do Usuário Autenticado
export interface Conta extends Usuario {
  podeAdministrar: boolean;
}

// Resposta Simples dos Fluxos de E-mail
export interface MensagemResposta {
  mensagem: string;
  email?: string | null;
}

// Resposta que Já Vem com Sessão Aberta
export interface SessaoResposta {
  mensagem: string;
  nome: string;
  email: string;
  token: string;
  tipo: string;
  expiraEmSegundos: number;
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
