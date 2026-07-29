import { apiFetch } from "./api";
import type { Avaliacao, Comentario, RespostaPaginada, ResumoAvaliacoes } from "./tipos";

// Funções de API das Avaliações
export function obterResumoAvaliacoes(livroId: number) {
  return apiFetch<ResumoAvaliacoes>(`/books/${livroId}/reviews/summary`);
}

export function listarResenhas(livroId: number, page = 0) {
  return apiFetch<RespostaPaginada<Avaliacao>>(`/books/${livroId}/reviews?page=${page}&size=10`);
}

// 204 Vira Undefined no ApiFetch: o Leitor Ainda Não Avaliou
export function obterMinhaAvaliacao(livroId: number) {
  return apiFetch<Avaliacao | undefined>(`/books/${livroId}/reviews/mine`);
}

export function salvarMinhaAvaliacao(
  livroId: number,
  dados: { rating: number; review?: string | null; spoiler: boolean },
) {
  return apiFetch<Avaliacao>(`/books/${livroId}/reviews/mine`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function removerMinhaAvaliacao(livroId: number) {
  return apiFetch<void>(`/books/${livroId}/reviews/mine`, { method: "DELETE" });
}

// Funções de API dos Comentários
export function listarComentarios(livroId: number, page = 0) {
  return apiFetch<RespostaPaginada<Comentario>>(`/books/${livroId}/comments?page=${page}&size=20`);
}

export function publicarComentario(livroId: number, text: string) {
  return apiFetch<Comentario>(`/books/${livroId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function removerComentario(livroId: number, comentarioId: number) {
  return apiFetch<void>(`/books/${livroId}/comments/${comentarioId}`, { method: "DELETE" });
}

export function marcarSpoiler(livroId: number, comentarioId: number, spoiler: boolean) {
  return apiFetch<Comentario>(
    `/books/${livroId}/comments/${comentarioId}/spoiler?spoiler=${spoiler}`,
    { method: "PATCH" },
  );
}
