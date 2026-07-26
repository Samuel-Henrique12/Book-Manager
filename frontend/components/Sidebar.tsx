"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Home, Library, LogOut, Plus } from "lucide-react";
import { limparSessao, obterEmail, obterNome } from "@/lib/auth";
import Logotipo, { SimboloLivro } from "@/components/Logotipo";

export const NAVEGACAO = [
  { href: "/", rotulo: "Início", Icone: Home },
  { href: "/books", rotulo: "Minha estante", Icone: Library },
];

// Leitura da Sessão sem setState em Efeito
const semAssinatura = () => () => {};

function useSessao() {
  const nome = useSyncExternalStore(semAssinatura, obterNome, () => "Leitor");
  const email = useSyncExternalStore(
    semAssinatura,
    () => obterEmail() ?? "",
    () => "",
  );
  return { nome, email };
}

// Barra Lateral Fixa
export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col bg-painel px-3 py-6 text-painel-texto lg:flex xl:w-[264px] xl:px-[18px]">
      <ConteudoNavegacao recolhida />
    </aside>
  );
}

// Conteúdo Compartilhado entre Barra e Gaveta
export function ConteudoNavegacao({
  recolhida = false,
  aoNavegar,
}: {
  recolhida?: boolean;
  aoNavegar?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { nome, email } = useSessao();

  // Em Modo Recolhido os Rótulos só Aparecem a Partir de XL
  const rotulo = recolhida ? "hidden xl:inline" : "inline";
  const centralizar = recolhida ? "justify-center xl:justify-start" : "";

  const iniciais =
    nome
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "L";

  function sair() {
    limparSessao();
    aoNavegar?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/"
        onClick={aoNavegar}
        aria-label="Book Manager — início"
        className={`mb-7 flex items-center px-1.5 ${centralizar}`}
      >
        {recolhida ? (
          <>
            <SimboloLivro tamanho={26} className="text-terracota xl:hidden" />
            <span className="hidden xl:inline">
              <Logotipo tamanho="sm" variante="escuro" />
            </span>
          </>
        ) : (
          <Logotipo tamanho="sm" variante="escuro" />
        )}
      </Link>

      <Link
        href="/books/new"
        onClick={aoNavegar}
        title="Novo livro"
        className={`mb-7 flex h-[42px] w-full items-center gap-2 rounded-xl bg-terracota text-[14px] font-semibold text-white transition hover:bg-terracota-escuro ${
          recolhida ? "justify-center xl:justify-center" : "justify-center"
        }`}
      >
        <Plus size={17} strokeWidth={2.3} />
        <span className={rotulo}>Novo livro</span>
      </Link>

      <div
        className={`mb-2 px-3 text-[11px] font-bold tracking-[0.09em] text-painel-rotulo ${
          recolhida ? "hidden xl:block" : "block"
        }`}
      >
        NAVEGAÇÃO
      </div>

      <nav className="flex flex-col gap-1">
        {NAVEGACAO.map(({ href, rotulo: texto, Icone }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={aoNavegar}
              title={texto}
              aria-current={ativo ? "page" : undefined}
              className={`flex h-[42px] items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition ${centralizar} ${
                ativo
                  ? "bg-terracota/22 text-painel-texto"
                  : "text-painel-suave hover:bg-white/5 hover:text-painel-texto"
              }`}
            >
              <Icone size={18} strokeWidth={1.9} className="shrink-0" />
              <span className={rotulo}>{texto}</span>
            </Link>
          );
        })}
      </nav>

      <div className="min-h-6 flex-1" />

      <div
        className={`flex items-center gap-3 border-t border-white/10 pt-4 ${
          recolhida ? "justify-center xl:justify-start" : ""
        }`}
      >
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-terracota text-[14px] font-semibold text-white">
          {iniciais}
        </div>
        <div className={`min-w-0 flex-1 ${recolhida ? "hidden xl:block" : "block"}`}>
          <div className="truncate text-[14px] font-semibold text-painel-texto">{nome}</div>
          <div className="truncate text-[12px] text-painel-suave">{email}</div>
        </div>
        <button
          type="button"
          onClick={sair}
          title="Sair"
          aria-label="Sair"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-painel-suave transition hover:bg-white/5 hover:text-painel-texto ${
            recolhida ? "hidden xl:flex" : "flex"
          }`}
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>
    </>
  );
}
