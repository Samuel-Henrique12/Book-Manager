"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import { CHAVE_CONTA, useConta } from "@/lib/conta";
import {
  alterarPerfilUsuario,
  listarUsuarios,
  removerUsuario,
} from "@/lib/usuarios";
import { ROTULO_PERFIL } from "@/lib/rotulos";
import type { Perfil, Usuario } from "@/lib/tipos";
import Painel from "@/components/ui/Painel";
import Paginacao from "@/components/Paginacao";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import Skeletons from "@/components/Skeletons";
import TabelaUsuarios from "@/components/admin/TabelaUsuarios";
import ModalEditarUsuario from "@/components/admin/ModalEditarUsuario";
import PainelImportacao from "@/components/admin/PainelImportacao";

const TAMANHO = 10;

// Tela de Administração de Usuários
export default function PaginaUsuarios() {
  const queryClient = useQueryClient();
  const alerta = useAlerta();
  const { data: conta } = useConta();

  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [pagina, setPagina] = useState(0);
  const [sortCampo, setSortCampo] = useState("nome");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alvoExclusao, setAlvoExclusao] = useState<Usuario | null>(null);
  const [emEdicao, setEmEdicao] = useState<Usuario | null>(null);
  const [idEmTroca, setIdEmTroca] = useState<number | null>(null);

  // Debounce da Busca — Reseta a Página
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAtiva(busca.trim());
      setPagina(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const sort = `${sortCampo},${sortDir}`;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["usuarios", buscaAtiva, pagina, sort],
    queryFn: () =>
      listarUsuarios({ busca: buscaAtiva || undefined, page: pagina, size: TAMANHO, sort }),
    placeholderData: keepPreviousData,
  });

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    queryClient.invalidateQueries({ queryKey: CHAVE_CONTA });
  }

  const trocaDePerfil = useMutation({
    mutationFn: ({ id, perfil }: { id: number; perfil: Perfil }) =>
      alterarPerfilUsuario(id, perfil),
    onMutate: ({ id }) => setIdEmTroca(id),
    onSuccess: (usuario) => {
      recarregar();
      alerta.sucesso("Perfil atualizado", `${usuario.nome} agora é ${ROTULO_PERFIL[usuario.perfil]}.`);
    },
    onError: (erro) =>
      alerta.erro(erro instanceof ApiError ? erro.message : "Não foi possível trocar o perfil"),
    onSettled: () => setIdEmTroca(null),
  });

  const exclusao = useMutation({
    mutationFn: (id: number) => removerUsuario(id),
    onSuccess: () => {
      setAlvoExclusao(null);
      recarregar();
      alerta.sucesso("Usuário excluído");
    },
    onError: (erro) => {
      setAlvoExclusao(null);
      alerta.erro(erro instanceof ApiError ? erro.message : "Não foi possível excluir o usuário");
    },
  });

  const usuarios = data?.conteudo ?? [];
  const total = data?.totalElementos ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;

  function ordenarPor(campo: string) {
    if (sortCampo === campo) {
      setSortDir((direcao) => (direcao === "asc" ? "desc" : "asc"));
    } else {
      setSortCampo(campo);
      setSortDir("asc");
    }
    setPagina(0);
  }

  return (
    <>
      <h1 className="mb-1 font-titulo text-[30px] font-bold tracking-[-0.03em]">Administração</h1>
      <p className="mb-7 text-[15px] text-suave">
        Gerencie as contas da plataforma e o acervo compartilhado.
      </p>

      <PainelImportacao />

      <div className="relative mb-6 max-w-[420px]">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-suave-2"
        />
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome ou e-mail"
          aria-label="Buscar usuários"
          className="h-[46px] w-full rounded-xl border border-borda bg-superficie pl-[44px] pr-4 text-[15px] text-tinta outline-none transition hover:border-borda-forte focus:border-terracota focus:shadow-[0_0_0_3px_var(--color-terracota-lavagem)]"
        />
      </div>

      {isPending && <Skeletons variante="lista" />}

      {isError && (
        <Painel
          compacto
          titulo="Erro ao carregar"
          descricao={
            error instanceof ApiError && error.status === 403
              ? "Você não tem permissão para administrar usuários."
              : "Não foi possível buscar os usuários. Tente novamente em instantes."
          }
        />
      )}

      {!isPending && !isError && total === 0 && (
        <Painel
          compacto
          tracejado
          icone={<Users size={28} strokeWidth={1.7} />}
          titulo={buscaAtiva ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
          descricao={
            buscaAtiva ? "Tente buscar por outro nome ou e-mail." : undefined
          }
          acao={
            buscaAtiva ? (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="rounded-xl border border-borda-forte px-4 py-2.5 text-[14px] font-semibold transition hover:bg-creme"
              >
                Limpar busca
              </button>
            ) : undefined
          }
        />
      )}

      {!isError && usuarios.length > 0 && (
        <>
          <TabelaUsuarios
            usuarios={usuarios}
            emailAtual={conta?.email}
            sortCampo={sortCampo}
            sortDir={sortDir}
            idEmTroca={idEmTroca}
            aoOrdenar={ordenarPor}
            aoTrocarPerfil={(usuario, perfil) => trocaDePerfil.mutate({ id: usuario.id, perfil })}
            aoEditar={setEmEdicao}
            aoExcluir={setAlvoExclusao}
          />

          <Paginacao
            pagina={pagina}
            totalPaginas={totalPaginas}
            aoAnterior={() => setPagina((atual) => Math.max(0, atual - 1))}
            aoProxima={() => setPagina((atual) => atual + 1)}
          />
        </>
      )}

      <ModalEditarUsuario
        usuario={emEdicao}
        aoFechar={() => setEmEdicao(null)}
        aoSalvar={recarregar}
      />

      <ModalConfirmacao
        aberto={alvoExclusao !== null}
        titulo="Excluir usuário?"
        descricao={
          <>
            A conta de <strong className="text-tinta">{alvoExclusao?.nome}</strong> deixará de ter
            acesso à plataforma. Esta ação não pode ser desfeita.
          </>
        }
        carregando={exclusao.isPending}
        aoCancelar={() => setAlvoExclusao(null)}
        aoConfirmar={() => alvoExclusao && exclusao.mutate(alvoExclusao.id)}
      />
    </>
  );
}
