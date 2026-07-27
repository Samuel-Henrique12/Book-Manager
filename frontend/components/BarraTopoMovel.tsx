"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logotipo from "@/components/Logotipo";
import { ConteudoNavegacao } from "@/components/Sidebar";

// Barra Superior e Gaveta do Mobile
export default function BarraTopoMovel() {
  const pathname = usePathname();

  // Guardar a Rota de Abertura Fecha a Gaveta ao Navegar, Sem Render em Cascate
  const [rotaAberta, setRotaAberta] = useState<string | null>(null);
  const aberta = rotaAberta !== null && rotaAberta === pathname;
  const setAberta = (valor: boolean) => setRotaAberta(valor ? pathname : null);

  // Escape e Trava de Rolagem
  useEffect(() => {
    if (!aberta) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setRotaAberta(null);
    }

    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = rolagemAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberta]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-borda bg-papel/92 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setAberta(true)}
          aria-label="Abrir menu"
          aria-expanded={aberta}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda bg-superficie text-tinta-2 transition hover:border-borda-forte"
        >
          <Menu size={19} strokeWidth={2} />
        </button>
        <Link href="/" aria-label="Book Manager — início">
          <Logotipo tamanho="sm" />
        </Link>
      </header>

      {aberta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setAberta(false)}
            style={{ animation: "fade 0.18s ease-out both" }}
            className="absolute inset-0 bg-painel/55 backdrop-blur-[3px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            style={{ animation: "deslizar-lateral 0.24s cubic-bezier(0.2,0.8,0.3,1) both" }}
            className="absolute inset-y-0 left-0 flex w-[272px] flex-col bg-painel px-[18px] py-6 text-painel-texto"
          >
            <button
              type="button"
              onClick={() => setAberta(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-painel-suave transition hover:bg-white/5 hover:text-painel-texto"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <ConteudoNavegacao aoNavegar={() => setAberta(false)} />
          </div>
        </div>
      )}
    </>
  );
}
