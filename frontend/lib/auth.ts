import Cookies from "js-cookie";

// Cookies
const TOKEN_COOKIE = "bm_token";
const NOME_COOKIE = "bm_nome";

  // Persistência do Cookie de Sessão
// Sem "expires" o cookie vive só enquanto o navegador estiver aberto.
function opcoes(lembrar: boolean) {
  return lembrar
    ? { expires: 1, sameSite: "lax" as const }
    : { sameSite: "lax" as const };
}

// Funções de Sessão
export function salvarSessao(token: string, nome?: string, lembrar = true) {
  Cookies.set(TOKEN_COOKIE, token, opcoes(lembrar));
  if (nome) {
    Cookies.set(NOME_COOKIE, nome, opcoes(lembrar));
  }
}

// Mantém o Nome Exibido em Sincronia Após Edição na Conta
export function salvarNome(nome: string) {
  Cookies.set(NOME_COOKIE, nome, opcoes(true));
}

export function limparSessao() {
  Cookies.remove(TOKEN_COOKIE);
  Cookies.remove(NOME_COOKIE);
}

// Funções de Autenticação
export function obterToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

function decodificarPayload(token: string): Record<string, unknown> | null {
  try {
    const parte = token.split(".")[1];
    const json = atob(parte.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function obterEmail(): string | null {
  const token = obterToken();
  if (!token) return null;
  const payload = decodificarPayload(token);
  return (payload?.sub as string) ?? null;
}

export function obterNome(): string {
  return Cookies.get(NOME_COOKIE) || obterEmail()?.split("@")[0] || "Leitor";
}
