"use client";

import { useConta } from "@/lib/conta";
import Painel, { TituloSecao } from "@/components/ui/Painel";
import FormDadosConta from "@/components/conta/FormDadosConta";
import FormAlterarSenha from "@/components/conta/FormAlterarSenha";
import ZonaDePerigo from "@/components/conta/ZonaDePerigo";

// Tela de Configuração da Conta
export default function PaginaConta() {
  const { data: conta, isPending, isError } = useConta();

  return (
    <div className="max-w-[720px]">
      <h1 className="mb-1 font-titulo text-[30px] font-bold tracking-[-0.03em]">Minha conta</h1>
      <p className="mb-8 text-[15px] text-suave">
        Atualize seus dados de acesso e gerencie sua conta.
      </p>

      {isPending && <Esqueleto />}

      {isError && (
        <Painel
          compacto
          titulo="Erro ao carregar"
          descricao="Não foi possível buscar os dados da sua conta. Tente novamente em instantes."
        />
      )}

      {conta && (
        <>
          <section className="mb-9">
            <TituloSecao>Dados</TituloSecao>
            <FormDadosConta conta={conta} />
          </section>

          <section className="mb-9">
            <TituloSecao>Segurança</TituloSecao>
            <FormAlterarSenha />
          </section>

          <section>
            <TituloSecao>Zona de perigo</TituloSecao>
            <ZonaDePerigo />
          </section>
        </>
      )}
    </div>
  );
}

// Placeholder de Carregamento dos Blocos
function Esqueleto() {
  return (
    <div className="flex flex-col gap-9" style={{ animation: "sk 1.4s ease-in-out infinite" }}>
      {[260, 220].map((altura) => (
        <div
          key={altura}
          className="rounded-2xl border border-borda bg-superficie"
          style={{ height: altura }}
        />
      ))}
    </div>
  );
}
