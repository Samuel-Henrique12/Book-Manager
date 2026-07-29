import type { Perfil, StatusLeitura } from "./tipos";

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

// Fita Sobre a Capa: Verde=Lido, Amarelo=Lendo, Terracota=Quero Ler, Vermelho=Abandonei
export const FITA_STATUS: Record<StatusLeitura, string> = {
  QUERO_LER: "bg-terracota",
  LENDO: "bg-amarelo",
  LIDO: "bg-verde",
  ABANDONADO: "bg-erro",
};
