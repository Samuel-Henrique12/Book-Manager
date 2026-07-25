"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { limparSessao, obterEmail, obterNome } from "@/lib/auth";
import Logotipo from "@/components/Logotipo";

// Component Sidebar
export default function Sidebar() {
  const router = useRouter();
  const [nome, setNome] = useState("Leitor");
  const [email, setEmail] = useState("leitor@bookmanager.app");

  useEffect(() => {
    setNome(obterNome());
    setEmail(obterEmail() ?? "leitor@bookmanager.app");
  }, []);

  const iniciais =
    nome
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "L";

  function sair() {
    limparSessao();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[258px] flex-shrink-0 flex-col bg-painel px-[18px] py-6 text-painel-texto">
      <Link href="/books" className="mb-6 flex items-center px-1.5">
        <Logotipo tamanho="sm" variante="escuro" />
      </Link>

      <Link
        href="/books/new"
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-terracota py-2.5 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro"
      >
        <Plus size={16} strokeWidth={2.2} />
        Novo livro
      </Link>

      <div className="mb-2 px-3 text-[11px] font-bold tracking-[0.09em] text-painel-rotulo">
        NAVEGAÇÃO
      </div>
      <nav className="flex flex-col gap-0.5">
        <Link
          href="/books"
          className="flex items-center gap-2 rounded-[9px] bg-terracota/22 px-3 py-2.5 text-[14px] font-medium text-painel-texto"
        >
          Biblioteca
        </Link>
      </nav>

      <div className="min-h-4 flex-1" />

      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
        <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-terracota text-[14px] font-semibold text-white">
          {iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-painel-texto">{nome}</div>
          <div className="truncate text-[12px] text-painel-suave">{email}</div>
        </div>
        <button
          onClick={sair}
          title="Sair"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-painel-suave transition hover:bg-white/5 hover:text-painel-texto"
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
