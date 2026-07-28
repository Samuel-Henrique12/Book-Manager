import { apiFetch } from "./api";
import type { Livro, LivroInput, LivroResumo, RespostaPaginada } from "./tipos";

// Params da Listagem de Livros
export interface ParamsListagem {
  titulo?: string;
  categoria?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// Funções de API para Livros
export function listarLivros(params: ParamsListagem) {
  const query = new URLSearchParams();
  if (params.titulo) query.set("titulo", params.titulo);
  if (params.categoria) query.set("categoria", params.categoria);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 12));
  if (params.sort) query.set("sort", params.sort);
  return apiFetch<RespostaPaginada<LivroResumo>>(`/books?${query.toString()}`);
}

// Funções de API para Livros

export function obterLivro(id: number) {
  return apiFetch<Livro>(`/books/${id}`);
}

export function criarLivro(dto: LivroInput) {
  return apiFetch<Livro>("/books/create", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function atualizarLivro(id: number, dto: LivroInput) {
  return apiFetch<Livro>(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function removerLivro(id: number) {
  return apiFetch<void>(`/books/${id}`, { method: "DELETE" });
}
