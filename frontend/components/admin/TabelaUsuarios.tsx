"use client";

import { Check, Loader2 } from "lucide-react";
import { CLASSE_PERFIL, ROTULO_PERFIL } from "@/lib/rotulos";
import type { Perfil, Usuario } from "@/lib/tipos";
import BotaoAcao from "@/components/ui/BotaoAcao";

const COLUNAS = [
  { campo: "nome", rotulo: "Nome", classe: "" },
  { campo: "email", rotulo: "E-mail", classe: "hidden sm:table-cell" },
  { campo: "perfil", rotulo: "Perfil", classe: "" },
  { campo: "criadoEm", rotulo: "Desde", classe: "hidden lg:table-cell" },
] as const;

const PERFIS: Perfil[] = ["USUARIO", "ADMIN"];

interface Props {
  usuarios: Usuario[];
  emailAtual?: string;
  sortCampo: string;
  sortDir: "asc" | "desc";
  idEmTroca?: number | null;
  aoOrdenar: (campo: string) => void;
  aoTrocarPerfil: (usuario: Usuario, perfil: Perfil) => void;
  aoEditar: (usuario: Usuario) => void;
  aoExcluir: (usuario: Usuario) => void;
}

// Tabela de Usuários da Administração
export default function TabelaUsuarios({
  usuarios,
  emailAtual,
  sortCampo,
  sortDir,
  idEmTroca,
  aoOrdenar,
  aoTrocarPerfil,
  aoEditar,
  aoExcluir,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-borda bg-superficie">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-borda bg-superficie-2">
            {COLUNAS.map((coluna) => {
              const ativo = sortCampo === coluna.campo;
              return (
                <th
                  key={coluna.campo}
                  scope="col"
                  aria-sort={ativo ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className={`px-5 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-suave ${coluna.classe}`}
                >
                  <button
                    type="button"
                    onClick={() => aoOrdenar(coluna.campo)}
                    className="flex items-center gap-1.5 transition hover:text-tinta-2"
                  >
                    {coluna.rotulo}
                    <span className="text-terracota">
                      {ativo ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-5 py-3 text-right">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const ehVoce = usuario.email.toLowerCase() === emailAtual?.toLowerCase();
            return (
              <tr key={usuario.id} className="border-b border-borda transition last:border-b-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-tinta">{usuario.nome}</span>
                    {ehVoce && (
                      <span className="rounded-full bg-creme px-1.5 py-0.5 text-[10.5px] font-semibold text-suave">
                        você
                      </span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-suave-2 sm:hidden">{usuario.email}</div>
                </td>

                <td className="hidden px-5 py-3 text-[14px] text-tinta-2 sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    {usuario.email}
                    {usuario.emailConfirmado && (
                      <Check size={14} className="text-verde" aria-label="E-mail confirmado" />
                    )}
                  </div>
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={usuario.perfil}
                      disabled={idEmTroca === usuario.id}
                      onChange={(evento) =>
                        aoTrocarPerfil(usuario, evento.target.value as Perfil)
                      }
                      aria-label={`Perfil de ${usuario.nome}`}
                      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-[12px] font-semibold outline-none transition disabled:opacity-60 ${CLASSE_PERFIL[usuario.perfil]}`}
                    >
                      {PERFIS.map((perfil) => (
                        <option key={perfil} value={perfil}>
                          {ROTULO_PERFIL[perfil]}
                        </option>
                      ))}
                    </select>
                    {idEmTroca === usuario.id && (
                      <Loader2 size={14} className="animate-spin text-suave-2" />
                    )}
                  </div>
                </td>

                <td className="hidden px-5 py-3 text-[13.5px] text-suave lg:table-cell">
                  {new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}
                </td>

                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <BotaoAcao tipo="editar" onClick={() => aoEditar(usuario)} />
                    <BotaoAcao tipo="excluir" onClick={() => aoExcluir(usuario)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
