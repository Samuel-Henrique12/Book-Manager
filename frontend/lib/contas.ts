import { apiFetch } from "./api";
import { salvarSessao } from "./auth";
import type { MensagemResposta, SessaoResposta, TokenResposta } from "./tipos";

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
  salvarSessao(resposta.token, resposta.nome, lembrar);
  return resposta;
}

// Confirmar o E-mail Ja Deixa o Usuario Logado
export async function confirmarEmail(token: string) {
  const resposta = await apiFetch<SessaoResposta>("/auth/confirmar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  salvarSessao(resposta.token, resposta.nome);
  return resposta;
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

// Redefinir a Senha Ja Deixa o Usuario Logado
export async function redefinirSenha(dados: { token: string; senha: string }) {
  const resposta = await apiFetch<SessaoResposta>("/auth/senha/redefinir", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  salvarSessao(resposta.token, resposta.nome);
  return resposta;
}
