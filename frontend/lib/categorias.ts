import { apiFetch } from "./api";
import type { Categoria } from "./tipos";

// Categorias com Volume Mínimo de Livros (Ordenadas das Maiores pra Menores)
export function listarCategorias(min = 1) {
  return apiFetch<Categoria[]>(`/categorias?min=${min}`);
}
