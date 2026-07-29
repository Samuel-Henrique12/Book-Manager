// Saudação da Home Conforme o Horário

export type Periodo = "neutro" | "madrugada" | "manha" | "tarde" | "noite";

interface Momento {
  saudacao: string;
  frases: string[];
}

const MOMENTOS: Record<Periodo, Momento> = {
  neutro: {
    saudacao: "Olá",
    frases: ["Bem-vindo de volta"],
  },
  madrugada: {
    saudacao: "Boa madrugada",
    frases: [
      "A coruja leitora está de plantão",
      "Só mais um capítulo, né?",
      "A madrugada é de quem lê",
      "O mundo dorme, a estante não",
    ],
  },
  manha: {
    saudacao: "Bom dia",
    frases: [
      "Café, silêncio e um bom capítulo",
      "A manhã rende quando começa com leitura",
      "Primeiras páginas do dia",
      "Leitura matinal é outro nível",
    ],
  },
  tarde: {
    saudacao: "Boa tarde",
    frases: [
      "Uma pausa e algumas páginas",
      "A tarde pede um capítulo",
      "Hora de retomar a leitura",
      "Aquele intervalo com a estante",
    ],
  },
  noite: {
    saudacao: "Boa noite",
    frases: [
      "A melhor hora para se perder num livro",
      "Modo leitura noturna ativado",
      "A noite é longa e a estante também",
      "Um capítulo antes de dormir",
    ],
  },
};

export const CHAVE_NEUTRA = "neutro:0";

function periodoDaHora(hora: number): Periodo {
  if (hora < 5) return "madrugada";
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

// Chave Primitiva Dentro do Período — useSyncExternalStore
export function chaveAtual(): string {
  const agora = new Date();
  const periodo = periodoDaHora(agora.getHours());
  // Girar Frase Sem Sortear a Cada Render por Dia
  const indice = agora.getDate() % MOMENTOS[periodo].frases.length;
  return `${periodo}:${indice}`;
}

export function interpretar(chave: string): { saudacao: string; frase: string } {
  const [periodo, indice] = chave.split(":");
  const momento = MOMENTOS[periodo as Periodo] ?? MOMENTOS.neutro;
  const posicao = Number(indice);
  return {
    saudacao: momento.saudacao,
    frase: momento.frases[Number.isNaN(posicao) ? 0 : posicao % momento.frases.length],
  };
}
