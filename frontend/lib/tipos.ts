export interface RespostaPaginada<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Categoria {
  id: number;
  name: string;
  slug: string;
}

export interface Livro {
  id: number;
  title: string;
  subtitle?: string | null;
  author: string;
  year?: number | null;
  description?: string | null;
  coverUrl?: string | null;
  isbn?: string | null;
  pageCount?: number | null;
  publisher?: string | null;
  publishedDate?: string | null;
  language?: string | null;
  averageRating?: number | null;
  ratingsCount?: number | null;
  previewLink?: string | null;
  categories?: Categoria[];
  createdAt?: string;
  updatedAt?: string;
}

export type LivroResumo = Pick<
  Livro,
  | "id"
  | "title"
  | "author"
  | "year"
  | "description"
  | "coverUrl"
  | "averageRating"
  | "ratingsCount"
  | "categories"
>;

// Avaliação (nota 1 ~ 5 Com Resenha Opcional | Uma Por User <-> Livro)
export interface Avaliacao {
  id: number;
  readerName: string;
  rating: number;
  review?: string | null;
  spoiler: boolean;
  mine: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FatiaNota {
  rating: number;
  count: number;
  percentage: number;
}

export interface ResumoAvaliacoes {
  average?: number | null;
  total: number;
  distribution: FatiaNota[];
}

// Comentário: Conversa Livre no Livro
export interface Comentario {
  id: number;
  readerName: string;
  text: string;
  spoiler: boolean;
  mine: boolean;
  createdAt: string;
}

// Acompanhamento da Importação do Google Books
export interface ProgressoImportacao {
  emAndamento: boolean;
  importados: number;
  ignorados: number;
  falhas: number;
  temaAtual?: string | null;
  temasConcluidos: number;
  totalTemas: number;
  mensagem?: string | null;
}

// Interface para Input de Livro
export interface LivroInput {
  title: string;
  author: string;
  year?: number | null;
  description?: string | null;
  coverUrl?: string | null;
  isbn?: string | null;
  pageCount?: number | null;
}

// TODO :
// Contratos das Fases 3-5 do Backend (estante, avaliação e progresso)
// Ainda não existem na API — os componentes que os consomem estão desativados

export type StatusLeitura = "QUERO_LER" | "LENDO" | "LIDO" | "ABANDONADO";

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
  nome: string;
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
