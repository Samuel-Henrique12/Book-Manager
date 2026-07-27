import { apiFetch } from "./api";
import { salvarSessao } from "./auth";
import type { MensagemResposta, TokenResposta } from "./tipos";

// Cria a Conta Sem Autenticar (Exige Confirmação no Email)
export function registrar(dados: { nome: string; email: string; senha: string }) {
  return apiFetch<MensagemResposta>("/auth/register", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function entrar(dados: { email: string; senha: string }, lembrar = true) {
  const resposta = await apiFetch<TokenResposta>("/auth/login", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  salvarSessao(resposta.token, undefined, lembrar);
  return resposta;
}

export function confirmarEmail(token: string) {
  return apiFetch<MensagemResposta>("/auth/confirmar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function reenviarConfirmacao(email: string) {
  return apiFetch<MensagemResposta>("/auth/reenviar-confirmacao", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function solicitarRedefinicao(email: string) {
  return apiFetch<MensagemResposta>("/auth/senha/esqueci", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function redefinirSenha(dados: { token: string; senha: string }) {
  return apiFetch<MensagemResposta>("/auth/senha/redefinir", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}
