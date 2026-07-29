import { apiFetch } from "./api";
import type { ItemEstante, RespostaPaginada, ResumoEstante, StatusLeitura } from "./tipos";

export interface EntradaEstante {
  status: StatusLeitura;
  favorite: boolean;
  currentPage?: number | null;
  totalPages?: number | null;
}

// 204 Vira Undefined: o Livro Não Está na Estante
export function obterVaga(livroId: number) {
  return apiFetch<ItemEstante | undefined>(`/books/${livroId}/shelf`);
}

export function salvarVaga(livroId: number, dados: EntradaEstante) {
  return apiFetch<ItemEstante>(`/books/${livroId}/shelf`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function removerVaga(livroId: number) {
  return apiFetch<void>(`/books/${livroId}/shelf`, { method: "DELETE" });
}

// Minha Estante
export function listarEstante(params: {
  status?: StatusLeitura | null;
  favorites?: boolean;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.favorites) query.set("favorites", "true");
  query.set("page", String(params.page ?? 0));
  query.set("size", "12");
  return apiFetch<RespostaPaginada<ItemEstante>>(`/shelf?${query.toString()}`);
}

export function obterResumoEstante() {
  return apiFetch<ResumoEstante>("/shelf/summary");
}
