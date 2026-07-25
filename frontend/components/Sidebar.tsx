"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookMarked, LogOut, Plus } from "lucide-react";
import { limparSessao, obterEmail, obterNome } from "@/lib/auth";

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
    <aside className="sticky top-0 flex h-screen w-[258px] flex-shrink-0 flex-col bg-painel px-[18px] py-6 text-[#e9e1d1]">
      <Link href="/books" className="mb-6 flex items-center gap-3 px-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracota text-papel">
          <BookMarked size={17} strokeWidth={1.8} />
        </div>
        <span className="font-serif text-[19px] font-medium text-papel">Book Manager</span>
      </Link>

      <Link
        href="/books/new"
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-terracota py-2.5 text-[14px] font-semibold text-white transition hover:bg-terracota-escuro"
      >
        <Plus size={16} strokeWidth={2.2} />
        Novo livro
      </Link>

      <div className="mb-2 px-3 text-[11px] font-bold tracking-[0.09em] text-[#6e665a]">
        NAVEGAÇÃO
      </div>
      <nav className="flex flex-col gap-0.5">
        <Link
          href="/books"
          className="flex items-center gap-2 rounded-[9px] bg-[rgba(192,69,31,0.22)] px-3 py-2.5 text-[14px] font-medium text-[#f7efe1]"
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
          <div className="truncate text-[14px] font-semibold text-papel">{nome}</div>
          <div className="truncate text-[12px] text-[#8a8172]">{email}</div>
        </div>
        <button
          onClick={sair}
          title="Sair"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#8a8172] transition hover:bg-white/5 hover:text-papel"
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
