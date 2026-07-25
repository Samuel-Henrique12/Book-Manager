"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, Lock, Mail, User } from "lucide-react";
import { entrar, registrar } from "@/lib/contas";
import { ApiError } from "@/lib/api";
import Logotipo from "@/components/Logotipo";
import CampoFormulario from "@/components/CampoFormulario";
import PainelLivros from "@/components/login/PainelLivros";

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

const CLASSE_BOTAO =
  "mt-7 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-terracota text-[16px] font-semibold text-white transition hover:bg-terracota-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota disabled:opacity-70";

export default function PaginaLogin() {
  const [modo, setModo] = useState<"login" | "registro">("login");

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[46fr_54fr]">
      <div className="flex items-center justify-center px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[430px]" style={{ animation: "rise 0.5s ease-out both" }}>
          <Logotipo tamanho="md" className="mb-11" />
          {modo === "login" ? (
            <FormularioLogin aoTrocar={() => setModo("registro")} />
          ) : (
            <FormularioRegistro aoTrocar={() => setModo("login")} />
          )}
        </div>
      </div>
      <PainelLivros className="hidden lg:block" />
    </div>
  );
}

// Título
function Cabecalho({
  linha1,
  linha2,
  subtitulo,
}: {
  linha1: string;
  linha2: string;
  subtitulo: string;
}) {
  return (
    <>
      <h1 className="font-serif text-[42px] font-medium leading-[1.07] tracking-[-0.02em] xl:text-[50px]">
        <span className="block text-tinta">{linha1}</span>
        <span className="block text-terracota">{linha2}</span>
      </h1>
      <p className="mb-9 mt-4 max-w-[330px] text-[16px] leading-relaxed text-tinta-2">
        {subtitulo}
      </p>
    </>
  );
}

function FormularioLogin({ aoTrocar }: { aoTrocar: () => void }) {
  const router = useRouter();
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
      toast.success("Login realizado com sucesso");
      router.push("/books");
      router.refresh();
    } catch (erro) {
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
          {/* TODO: Fluxo de Recuperação de Senha — a API ainda não expõe o endpoint */}
          <span className="cursor-not-allowed text-[14px] font-medium text-terracota opacity-90">
            Esqueceu sua senha?
          </span>
        </div>

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={17} className="animate-spin" />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <Rodape
        pergunta="Não tem uma conta?"
        acao="Criar conta"
        aoTrocar={aoTrocar}
      />
    </>
  );
}

function FormularioRegistro({ aoTrocar }: { aoTrocar: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({ resolver: zodResolver(registroSchema) });

  async function aoEnviar(dados: RegistroForm) {
    try {
      await registrar(dados);
      toast.success("Conta criada com sucesso");
      router.push("/books");
      router.refresh();
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

// Switch de Entrar e Criar Conta
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
