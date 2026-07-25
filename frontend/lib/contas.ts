import { apiFetch } from "./api";
import { salvarSessao } from "./auth";
import type { TokenResposta } from "./tipos";

export async function registrar(dados: { nome: string; email: string; senha: string }) {
  const resposta = await apiFetch<TokenResposta>("/auth/register", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  salvarSessao(resposta.token, dados.nome);
  return resposta;
}

export async function entrar(dados: { email: string; senha: string }) {
  const resposta = await apiFetch<TokenResposta>("/auth/login", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  salvarSessao(resposta.token);
  return resposta;
}
