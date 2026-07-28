import { apiFetch } from "./api";
import type { Categoria } from "./tipos";

// Categorias que Possuem Livros no Acervo
export function listarCategorias() {
  return apiFetch<Categoria[]>("/categorias");
}
