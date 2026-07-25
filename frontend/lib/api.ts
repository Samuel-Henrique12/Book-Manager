import { limparSessao, obterToken } from "./auth";
import type { ProblemDetail } from "./tipos";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Classe de Erro pra Requisições da API
export class ApiError extends Error {
  status: number;
  problem?: ProblemDetail;
  campos?: Record<string, string>;

  // Constructor da ApiError
  constructor(status: number, mensagem: string, problem?: ProblemDetail) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
    this.campos = problem?.campos;
  }
}

// Requisições à API
export async function apiFetch<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const token = obterToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_BASE}${caminho}`, { ...init, headers });

  // 401 em Rota Autenticada = Sessão Expirada -> Logout. Em /auth = Credencial Inválida
  if (resposta.status === 401 && !caminho.startsWith("/auth")) {
    limparSessao();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  if (!resposta.ok) {
    let problem: ProblemDetail | undefined;
    try {
      problem = (await resposta.json()) as ProblemDetail;
    } catch {
      problem = undefined;
    }
    const mensagem = problem?.detail || problem?.title || "Erro ao processar a requisição";
    throw new ApiError(resposta.status, mensagem, problem);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}
