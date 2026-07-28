import { apiFetch } from "./api";
import type { Conta, Perfil, RespostaPaginada, Usuario } from "./tipos";

// Params da Listagem de Usuários
export interface ParamsUsuarios {
  busca?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// Funções de API da Própria Conta
export function obterMinhaConta() {
  return apiFetch<Conta>("/minha-conta");
}

export function atualizarMinhaConta(nome: string) {
  return apiFetch<Conta>("/minha-conta", {
    method: "PUT",
    body: JSON.stringify({ nome }),
  });
}

export function alterarSenha(dados: { senhaAtual: string; novaSenha: string }) {
  return apiFetch<void>("/minha-conta/senha", {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function excluirMinhaConta() {
  return apiFetch<void>("/minha-conta", { method: "DELETE" });
}

// Funções de API da Administração de Usuários
export function listarUsuarios(params: ParamsUsuarios) {
  const query = new URLSearchParams();
  if (params.busca) query.set("busca", params.busca);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  if (params.sort) query.set("sort", params.sort);
  return apiFetch<RespostaPaginada<Usuario>>(`/usuarios?${query.toString()}`);
}

export function atualizarUsuario(id: number, nome: string) {
  return apiFetch<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nome }),
  });
}

export function alterarPerfilUsuario(id: number, perfil: Perfil) {
  return apiFetch<Usuario>(`/usuarios/${id}/perfil`, {
    method: "PATCH",
    body: JSON.stringify({ perfil }),
  });
}

export function removerUsuario(id: number) {
  return apiFetch<void>(`/usuarios/${id}`, { method: "DELETE" });
}
