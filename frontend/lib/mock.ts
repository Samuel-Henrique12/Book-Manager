// TODO: Dados de Exemplo das Fases 2-5
// Estante, avaliação, progresso e categorias ainda não existem na API
// (ver .planejamento/README.md). Tudo aqui é derivado do id do livro de forma
// determinística — mock aleatório piscaria entre renders e entre páginas.
// Quando o backend existir, este arquivo inteiro é apagado.

import type {
  Categoria,
  EstanteItem,
  EventoTimeline,
  LivroResumo,
  StatusLeitura,
} from "./tipos";

export const CATEGORIAS: Categoria[] = [
  { slug: "ficcao", nome: "Ficção" },
  { slug: "romance", nome: "Romance" },
  { slug: "fantasia", nome: "Fantasia" },
  { slug: "suspense", nome: "Suspense" },
  { slug: "terror", nome: "Terror" },
  { slug: "tecnico", nome: "Técnico" },
];

const STATUS_POR_RESTO: StatusLeitura[] = [
  "LIDO",
  "LENDO",
  "QUERO_LER",
  "LIDO",
  "QUERO_LER",
  "ABANDONADO",
  "LIDO",
];

// Espalhamento Determinístico
function embaralhar(semente: number, sal: number): number {
  const n = Math.abs(Math.round(semente)) * 2654435761 + sal * 40503;
  return Math.abs(n % 1000);
}

// Item de Estante do Livro
export function estanteDoLivro(livro: LivroResumo): EstanteItem {
  const id = livro.id;
  const status = STATUS_POR_RESTO[embaralhar(id, 1) % STATUS_POR_RESTO.length];

  const total = 180 + (embaralhar(id, 2) % 5) * 74;
  const lendo = status === "LENDO";
  const avaliado = status === "LIDO" || status === "ABANDONADO";

  return {
    status,
    favorito: embaralhar(id, 3) % 4 === 0,
    nota: avaliado ? 3 + (embaralhar(id, 4) % 3) : null,
    paginaAtual: lendo ? Math.max(12, Math.round((total * (8 + (embaralhar(id, 5) % 80))) / 100)) : null,
    totalPaginas: lendo ? total : null,
    categorias: categoriasDoLivro(id),
  };
}

function categoriasDoLivro(id: number): string[] {
  const primeira = CATEGORIAS[embaralhar(id, 6) % CATEGORIAS.length];
  const segunda = CATEGORIAS[embaralhar(id, 7) % CATEGORIAS.length];
  return primeira.slug === segunda.slug ? [primeira.slug] : [primeira.slug, segunda.slug];
}

const QUANDO = ["há 2 horas", "há 5 horas", "ontem", "há 2 dias", "há 4 dias", "há 1 semana"];

const COMENTARIOS = [
  "Comecei devagar, mas a ambientação me pegou de vez.",
  "Melhor coisa que li no semestre. Já quero reler.",
  "Travei no meio, mas voltei e valeu a pena.",
  "O final muda tudo — a irmã dele era a narradora o tempo todo.",
  "Ritmo estranho no começo, ótimo do meio pro fim.",
  "Larguei na página 90. Não era o momento.",
];

// Feed de Atividade Recente
export function eventosRecentes(livros: LivroResumo[]): EventoTimeline[] {
  return livros.slice(0, 6).map((livro, indice) => {
    const estante = estanteDoLivro(livro);
    const tipo = tipoDoEvento(estante.status, indice);
    const temComentario = tipo === "TERMINOU" || tipo === "PROGREDIU" || tipo === "ABANDONOU";
    const comentario = COMENTARIOS[embaralhar(livro.id, 8) % COMENTARIOS.length];

    return {
      id: `${livro.id}-${tipo}`,
      tipo,
      livroId: livro.id,
      livroTitulo: livro.titulo,
      quando: QUANDO[indice % QUANDO.length],
      nota: tipo === "TERMINOU" || tipo === "AVALIOU" ? estante.nota : null,
      comentario: temComentario ? comentario : null,
      spoiler: temComentario && embaralhar(livro.id, 9) % 3 === 0,
    };
  });
}

function tipoDoEvento(status: StatusLeitura, indice: number): EventoTimeline["tipo"] {
  if (status === "LENDO") return indice % 2 === 0 ? "PROGREDIU" : "INICIOU";
  if (status === "LIDO") return indice % 2 === 0 ? "TERMINOU" : "AVALIOU";
  if (status === "ABANDONADO") return "ABANDONOU";
  return indice % 2 === 0 ? "ADICIONOU" : "FAVORITOU";
}

// Resumo Numérico da Estante
export function resumoDaEstante(livros: LivroResumo[], total: number) {
  const itens = livros.map(estanteDoLivro);
  const proporcao = livros.length > 0 ? total / livros.length : 0;
  const contar = (status: StatusLeitura) =>
    Math.round(itens.filter((i) => i.status === status).length * proporcao);

  return {
    lendo: contar("LENDO"),
    lidos: contar("LIDO"),
    queroLer: contar("QUERO_LER"),
    total,
  };
}
