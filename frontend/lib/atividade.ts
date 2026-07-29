import { apiFetch } from "./api";
import type { Atividade } from "./tipos";

// Últimas Resenhas e Comentários da Comunidade
export function listarAtividade(size = 8) {
  return apiFetch<Atividade[]>(`/activity?size=${size}`);
}
