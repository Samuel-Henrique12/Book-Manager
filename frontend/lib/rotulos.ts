import type { Perfil, StatusLeitura, TipoEvento } from "./tipos";

export const ROTULO_PERFIL: Record<Perfil, string> = {
  USUARIO: "Leitor",
  ADMIN: "Administrador",
};

// Cores do Badge de Perfil
export const CLASSE_PERFIL: Record<Perfil, string> = {
  USUARIO: "bg-superficie-2 text-suave",
  ADMIN: "bg-terracota-lavagem text-terracota-escuro",
};

export const ROTULO_STATUS: Record<StatusLeitura, string> = {
  QUERO_LER: "Quero ler",
  LENDO: "Lendo",
  LIDO: "Lido",
  ABANDONADO: "Abandonado",
};

// Cores do Badge de Status
export const CLASSE_STATUS: Record<StatusLeitura, string> = {
  QUERO_LER: "bg-terracota-lavagem text-terracota-escuro",
  LENDO: "bg-amarelo/15 text-amarelo-escuro",
  LIDO: "bg-verde/12 text-verde",
  ABANDONADO: "bg-erro-lavagem text-erro",
};

// Fita Sobre a Capa: Verde=Lido, Amarelo=Lendo, Terracota=Quero Ler, Vermelho=Abandonei
export const FITA_STATUS: Record<StatusLeitura, string> = {
  QUERO_LER: "bg-terracota",
  LENDO: "bg-amarelo",
  LIDO: "bg-verde",
  ABANDONADO: "bg-erro",
};

export const ROTULO_EVENTO: Record<TipoEvento, string> = {
  ADICIONOU: "adicionou à estante",
  INICIOU: "começou a ler",
  TERMINOU: "terminou de ler",
  AVALIOU: "avaliou",
  FAVORITOU: "favoritou",
  ABANDONOU: "abandonou",
  PROGREDIU: "avançou na leitura de",
};
