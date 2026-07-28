import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie de Armazenamento do Token JWT e Rotas Públicas
const TOKEN_COOKIE = "bm_token";
const ROTAS_PUBLICAS = ["/login", "/confirmar-email", "/esqueci-senha", "/redefinir-senha"];

// Rotas Acessíveis Mesmo Logado
const SEMPRE_LIBERADAS = ["/confirmar-email", "/redefinir-senha"];

// Proxy pra Redirecionamento Baseado em Autenticação
export function proxy(requisicao: NextRequest) {
  const token = requisicao.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = requisicao.nextUrl;
  const ehPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));
  const ehLiberada = SEMPRE_LIBERADAS.some((rota) => pathname.startsWith(rota));

  if (!token && !ehPublica) {
    return NextResponse.redirect(new URL("/login", requisicao.url));
  }
  if (token && ehPublica && !ehLiberada) {
    return NextResponse.redirect(new URL("/books", requisicao.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/books/:path*",
    "/conta",
    "/admin/:path*",
    "/login",
    "/confirmar-email",
    "/esqueci-senha",
    "/redefinir-senha",
  ],
};
