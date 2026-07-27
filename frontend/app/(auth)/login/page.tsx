"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, Lock, Mail, User } from "lucide-react";
import { entrar, registrar } from "@/lib/contas";
import { ApiError } from "@/lib/api";
import { obterNome } from "@/lib/auth";
import CampoFormulario from "@/components/CampoFormulario";
import Cabecalho, { CLASSE_BOTAO } from "@/components/login/Cabecalho";
import AvisoConfirmacao from "@/components/login/AvisoConfirmacao";
import ModalBoasVindas from "@/components/login/ModalBoasVindas";

// Schemas de Validação com Zod
const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});
const registroSchema = z.object({
  nome: z.string().min(1, "Informe seu nome"),
  email: z.string().min(1, "Informe seu e-mail").email("Informe um e-mail válido"),
  senha: z.string().min(4, "Mínimo de 4 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegistroForm = z.infer<typeof registroSchema>;

type Pendencia = { email: string; jaCadastrado: boolean };

export default function PaginaLogin() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [pendencia, setPendencia] = useState<Pendencia | null>(null);
  const [boasVindas, setBoasVindas] = useState<string | null>(null);

  if (pendencia) {
    return (
      <AvisoConfirmacao
        email={pendencia.email}
        titulo={pendencia.jaCadastrado ? "Falta confirmar seu e-mail" : "Confirme seu e-mail"}
        descricao={
          pendencia.jaCadastrado
            ? "Sua conta existe, mas ainda não foi ativada. O link foi enviado para"
            : undefined
        }
        aoVoltar={() => {
          setPendencia(null);
          setModo("login");
        }}
      />
    );
  }

  return (
    <>
      {modo === "login" ? (
        <FormularioLogin
          aoTrocar={() => setModo("registro")}
          aoPendente={(email) => setPendencia({ email, jaCadastrado: true })}
          aoEntrar={() => setBoasVindas(obterNome())}
        />
      ) : (
        <FormularioRegistro
          aoTrocar={() => setModo("login")}
          aoRegistrar={(email) => setPendencia({ email, jaCadastrado: false })}
        />
      )}

      {boasVindas && (
        <ModalBoasVindas
          nome={boasVindas}
          aoConcluir={() => {
            router.push("/books");
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function FormularioLogin({
  aoTrocar,
  aoPendente,
  aoEntrar,
}: {
  aoTrocar: () => void;
  aoPendente: (email: string) => void;
  aoEntrar: () => void;
}) {
  const [lembrar, setLembrar] = useState(true);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function aoEnviar(dados: LoginForm) {
    try {
      await entrar(dados, lembrar);
      aoEntrar();
    } catch (erro) {
      // 403 de Conta Criada Mas Ainda Nõa Confirmada
      if (erro instanceof ApiError && erro.status === 403) {
        aoPendente(dados.email);
        return;
      }
      aplicarErro(erro, setError);
    }
  }

  return (
    <>
      <Cabecalho
        linha1="Grandes histórias"
        linha2="sempre com você"
        subtitulo="Descubra, leia e transforme ideias em novos mundos."
      />

      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <CampoFormulario
          rotulo="E-mail"
          placeholder="E-mail"
          tipo="email"
          autoComplete="email"
          icone={<Mail size={19} strokeWidth={1.7} />}
          erro={errors.email?.message}
          {...register("email")}
        />

        <CampoFormulario
          className="mt-3.5"
          rotulo="Senha"
          placeholder="Senha"
          senha
          autoComplete="current-password"
          icone={<Lock size={19} strokeWidth={1.7} />}
          erro={errors.senha?.message}
          {...register("senha")}
        />

        <div className="mt-5 flex items-center justify-between gap-4">
          <CaixaLembrar marcada={lembrar} aoMudar={setLembrar} />
          <Link
            href="/esqueci-senha"
            className="text-[14px] font-medium text-terracota transition hover:text-terracota-escuro hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={17} className="animate-spin" />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <Rodape pergunta="Não tem uma conta?" acao="Criar conta" aoTrocar={aoTrocar} />
    </>
  );
}

function FormularioRegistro({
  aoTrocar,
  aoRegistrar,
}: {
  aoTrocar: () => void;
  aoRegistrar: (email: string) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({ resolver: zodResolver(registroSchema) });

  async function aoEnviar(dados: RegistroForm) {
    try {
      await registrar(dados);
      aoRegistrar(dados.email);
    } catch (erro) {
      aplicarErro(erro, setError);
    }
  }

  return (
    <>
      <Cabecalho
        linha1="Sua estante começa"
        linha2="em um minuto"
        subtitulo="Crie sua conta e mantenha cada leitura sempre à mão."
      />

      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <CampoFormulario
          rotulo="Nome"
          placeholder="Nome"
          autoComplete="name"
          icone={<User size={19} strokeWidth={1.7} />}
          erro={errors.nome?.message}
          {...register("nome")}
        />

        <CampoFormulario
          className="mt-3.5"
          rotulo="E-mail"
          placeholder="E-mail"
          tipo="email"
          autoComplete="email"
          icone={<Mail size={19} strokeWidth={1.7} />}
          erro={errors.email?.message}
          {...register("email")}
        />

        <CampoFormulario
          className="mt-3.5"
          rotulo="Senha"
          placeholder="Senha (mínimo 4 caracteres)"
          senha
          autoComplete="new-password"
          icone={<Lock size={19} strokeWidth={1.7} />}
          erro={errors.senha?.message}
          {...register("senha")}
        />

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={17} className="animate-spin" />}
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <Rodape pergunta="Já tem uma conta?" acao="Entrar" aoTrocar={aoTrocar} />
    </>
  );
}

// CheckBox de Lembrar-me
function CaixaLembrar({
  marcada,
  aoMudar,
}: {
  marcada: boolean;
  aoMudar: (valor: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-[14px] text-tinta-2">
      <span className="relative flex h-[19px] w-[19px] items-center justify-center">
        <input
          type="checkbox"
          checked={marcada}
          onChange={(e) => aoMudar(e.target.checked)}
          className="peer h-[19px] w-[19px] cursor-pointer appearance-none rounded-[6px] border border-borda-forte bg-superficie transition checked:border-terracota checked:bg-terracota"
        />
        <Check
          size={12}
          strokeWidth={3.4}
          aria-hidden="true"
          className="pointer-events-none absolute text-white opacity-0 transition peer-checked:opacity-100"
        />
      </span>
      Lembrar-me
    </label>
  );
}

// Alternância entre Entrar e Criar Conta
function Rodape({
  pergunta,
  acao,
  aoTrocar,
}: {
  pergunta: string;
  acao: string;
  aoTrocar: () => void;
}) {
  return (
    <p className="mt-8 text-center text-[14px] text-suave">
      {pergunta}{" "}
      <button
        type="button"
        onClick={aoTrocar}
        className="font-semibold text-terracota transition hover:text-terracota-escuro hover:underline"
      >
        {acao}
      </button>
    </p>
  );
}

function aplicarErro<T extends FieldValues>(erro: unknown, setError: UseFormSetError<T>) {
  if (erro instanceof ApiError && erro.campos) {
    Object.entries(erro.campos).forEach(([campo, mensagem]) =>
      setError(campo as Path<T>, { message: mensagem }),
    );
    return;
  }
  toast.error(erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor");
}
