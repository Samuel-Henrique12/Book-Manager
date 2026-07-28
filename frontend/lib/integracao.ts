import { apiFetch } from "./api";
import type { ProgressoImportacao } from "./tipos";

// Dispara a Importação em Lote (somente ADMIN)
export function importarDoGoogleBooks() {
  return apiFetch<ProgressoImportacao>("/integracao/importar", { method: "POST" });
}

export function obterProgressoImportacao() {
  return apiFetch<ProgressoImportacao>("/integracao/importacao");
}
